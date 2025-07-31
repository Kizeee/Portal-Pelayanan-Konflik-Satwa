<script setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';

const emit = defineEmits(['location-selected']);

const mapContainer = ref(null);
let map = null;
let marker = null;

const defaultCenter = [0.5104, 101.4383];

const isLocating = ref(false);
const locationAccuracy = ref(null);

const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
let searchTimeout = null;

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
  emit('location-selected', { lat: latLng[0], lng: latLng[1] });
  
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
        emit('location-selected', userLatLng);
        locationAccuracy.value = position.coords.accuracy;
        isLocating.value = false;
      },
      (error) => {
        console.error("Error getting user location:", error);
        alert("Gagal mendapatkan lokasi Anda. Pastikan Anda telah memberikan izin akses lokasi untuk situs ini.");
        isLocating.value = false;
      }
    );
  } else {
    alert("Geolocation tidak didukung oleh browser ini.");
  }
};

onMounted(() => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value).setView(defaultCenter, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  marker = L.marker(defaultCenter, {
    draggable: true,
  }).addTo(map);

  const pos = marker.getLatLng();
  emit('location-selected', { lat: pos.lat, lng: pos.lng });

  marker.on('dragend', () => {
    const newPosition = marker.getLatLng();
    emit('location-selected', {
      lat: newPosition.lat,
      lng: newPosition.lng,
    });
    locationAccuracy.value = null;
  });

  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    emit('location-selected', {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });
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
      <span>{{ isLocating ? 'Mendeteksi Lokasi...' : 'Atau Gunakan Lokasi Saya Saat Ini' }}</span>
    </button>
    <p class="text-sm text-center text-gray-600 mb-2">Atau, klik pada peta / geser pin untuk menentukan lokasi secara manual.</p>
    <div ref="mapContainer" style="height: 400px; width: 100%; border-radius: 0.75rem;"></div>
    
    <div v-if="locationAccuracy" class="mt-2 text-center text-sm p-2 rounded-md" :class="locationAccuracy > 1000 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'">
      <span v-if="locationAccuracy > 1000">Akurasi lokasi rendah (sekitar {{ (locationAccuracy / 1000).toFixed(1) }} km). Disarankan untuk menggeser pin secara manual.</span>
      <span v-else>Akurasi lokasi sekitar {{ Math.round(locationAccuracy) }} meter.</span>
    </div>
  </div>
</template>