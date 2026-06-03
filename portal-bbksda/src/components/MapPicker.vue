<script setup>
import { ref, onMounted, nextTick } from 'vue';
import L from 'leaflet';
import riauBoundary from '@/data/riau-boundary.json';
import { validateCoordinate } from '@/utils/coordinateValidator';

const emit = defineEmits(['location-selected']);

const mapContainer = ref(null);
let map = null;
let marker = null;

const defaultCenter = [0.5104, 101.4383];

const isLocating = ref(false);
const locationAccuracy = ref(null);

// --- STATE VALIDASI KOORDINAT ---
const coordinateError = ref(null);

const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
let searchTimeout = null;

/**
 * Validasi koordinat dan emit hasilnya ke parent.
 * Jika valid → emit koordinat, hapus error.
 * Jika tidak valid → emit null, tampilkan pesan error.
 *
 * Setelah perubahan status validasi, panggil invalidateSize()
 * agar Leaflet merefresh tile rendering.
 */
const validateAndEmit = (lat, lng) => {
  const result = validateCoordinate(lat, lng);

  if (result.valid) {
    coordinateError.value = null;
    emit('location-selected', { lat, lng, isValid: true });
  } else {
    if (result.code === 'OUTSIDE_RIAU') {
      coordinateError.value = 'Lokasi yang dipilih berada di luar wilayah layanan BBKSDA Riau. Periksa kembali titik lokasi.';
    } else {
      coordinateError.value = result.message;
    }
    emit('location-selected', { lat, lng, isValid: false });
  }

  // Paksa Leaflet merefresh tile setelah Vue update DOM
  nextTick(() => {
    if (map) map.invalidateSize();
  });
};

const searchLocation = () => {
  clearTimeout(searchTimeout);
  if (searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }
  
  isSearching.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&countrycodes=id&viewbox=98.5,5.5,104.0,-1.0&bounded=1`);
      const data = await response.json();
      searchResults.value = data;
    } catch (error) {
      console.error("Error fetching geocoding data:", error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 500);
};

const selectLocation = (location) => {
  const latLng = [parseFloat(location.lat), parseFloat(location.lon)];
  map.setView(latLng, 15);
  marker.setLatLng(latLng);
  validateAndEmit(latLng[0], latLng[1]);
  
  searchResults.value = [];
  searchQuery.value = location.display_name;
  locationAccuracy.value = null;
};

const getUserLocation = () => {
  if (navigator.geolocation) {
    isLocating.value = true;
    locationAccuracy.value = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setView(userLatLng, 15);
        marker.setLatLng(userLatLng);
        validateAndEmit(userLatLng.lat, userLatLng.lng);
        locationAccuracy.value = position.coords.accuracy;
        isLocating.value = false;
      },
      (error) => {
        console.error("Error getting user location:", error);
        alert("Gagal mendapatkan lokasi Anda. Pastikan Anda telah memberikan izin akses lokasi untuk situs ini.");
        isLocating.value = false;
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  } else {
    alert("Geolocation tidak didukung oleh browser ini.");
  }
};

onMounted(() => {
  if (!mapContainer.value) return;

  // Batasi tampilan peta ke area sekitar Riau agar tile selalu termuat dengan benar
  const riauBounds = L.latLngBounds(L.latLng(-1.0, 99.0), L.latLng(3.0, 104.5));

  map = L.map(mapContainer.value, {
    maxBounds: riauBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 7,
  }).setView(defaultCenter, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Tampilkan batas wilayah Riau di peta sebagai visual guide
  L.geoJSON(riauBoundary, {
    style: {
      color: '#0e7a3a',
      weight: 2,
      opacity: 0.7,
      fillColor: '#16a34a',
      fillOpacity: 0.05,
      dashArray: '6, 4',
    },
  }).addTo(map);

  marker = L.marker(defaultCenter, {
    draggable: true,
  }).addTo(map);

  // Validasi posisi awal marker (default center)
  validateAndEmit(defaultCenter[0], defaultCenter[1]);

  marker.on('dragend', () => {
    const newPosition = marker.getLatLng();
    validateAndEmit(newPosition.lat, newPosition.lng);
    locationAccuracy.value = null;
  });

  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    validateAndEmit(e.latlng.lat, e.latlng.lng);
    locationAccuracy.value = null;
  });
});
</script>

<template>
  <div>
    <div class="relative mb-4">
      <label for="location-search" class="sr-only">Cari Lokasi</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          type="text" 
          id="location-search"
          v-model="searchQuery"
          @input="searchLocation"
          placeholder="Ketik nama desa atau jalan..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light"
          autocomplete="off"
        />
      </div>
      <ul v-if="searchResults.length > 0" class="absolute z-[1001] w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
        <li v-for="result in searchResults" :key="result.place_id" @click="selectLocation(result)" class="px-4 py-2 cursor-pointer hover:bg-gray-100">
          {{ result.display_name }}
        </li>
      </ul>
      <p v-if="isSearching" class="text-sm text-gray-500 mt-1">Mencari...</p>
    </div>

    <button 
      type="button" 
      @click="getUserLocation" 
      :disabled="isLocating"
      class="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mb-4 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-blue-400 disabled:cursor-wait">
      <svg v-if="!isLocating" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
      </svg>
      <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>{{ isLocating ? 'Mendeteksi Lokasi...' : 'Gunakan Lokasi Saat Ini' }}</span>
    </button>
    <p class="text-sm text-center text-gray-600 mb-2">Atau klik langsung pada peta / geser pin ke titik kejadian.</p>
    
    <!-- Info wilayah layanan -->
    <div class="flex items-center gap-2 mb-2 px-1">
      <span class="inline-block w-4 h-0.5 border-t-2 border-dashed" style="border-color: #0e7a3a;"></span>
      <span class="text-xs text-gray-500">Batas wilayah layanan BBKSDA Riau</span>
    </div>

    <!-- Wrapper terpisah untuk styling visual — Leaflet container TIDAK boleh punya border-radius / dynamic class -->
    <div class="map-wrapper" :class="{ 'map-wrapper--error': coordinateError }">
      <div ref="mapContainer" class="map-container"></div>
    </div>
    
    <!-- Pesan error validasi koordinat -->
    <div v-if="coordinateError" class="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span>{{ coordinateError }}</span>
    </div>

    <!-- Pesan sukses validasi -->
    <div v-else-if="!coordinateError && mapContainer" class="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>Titik lokasi berada dalam wilayah layanan BBKSDA Riau.</span>
    </div>

    <div v-if="locationAccuracy" class="mt-2 text-center text-sm p-2 rounded-md" :class="locationAccuracy > 1000 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'">
      <span v-if="locationAccuracy > 1000">Akurasi lokasi rendah (sekitar {{ (locationAccuracy / 1000).toFixed(1) }} km). Disarankan untuk menggeser pin secara manual.</span>
      <span v-else>Akurasi lokasi sekitar {{ Math.round(locationAccuracy) }} meter.</span>
    </div>
  </div>
</template>

<style scoped>
/*
 * Wrapper terpisah dari Leaflet container.
 * border-radius dan box-shadow diterapkan di sini,
 * BUKAN di div yang jadi container Leaflet,
 * agar tidak mengganggu rendering tile.
 */
.map-wrapper {
  border-radius: 0.75rem;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.map-wrapper--error {
  box-shadow: 0 0 0 3px #f87171;
}

.map-container {
  height: 400px;
  width: 100%;
}
</style>
