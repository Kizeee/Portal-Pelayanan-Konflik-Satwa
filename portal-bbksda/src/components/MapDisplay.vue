<script setup>
import { onMounted, ref, watch } from 'vue';
import L from 'leaflet';
import riauBoundary from '@/data/riau-boundary.json';

const props = defineProps({
  reports: {
    type: Array,
    required: true,
  },
});

const mapContainer = ref(null);
let map = null;
let markers = L.layerGroup();

const setupMap = () => {
  if (!mapContainer.value || map) return;
  const riauCenter = [0.5104, 101.4383];

  // Batas wilayah Riau (southwest, northeast)
  const riauBounds = L.latLngBounds(
    L.latLng(-0.35, 99.90),  // southwest
    L.latLng(2.35, 103.70)   // northeast
  );

  map = L.map(mapContainer.value, {
    maxBounds: riauBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 7,
  }).setView(riauCenter, 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Tampilkan garis batas wilayah Riau
  L.geoJSON(riauBoundary, {
    style: {
      color: '#0e7a3a',
      weight: 3,
      opacity: 0.8,
      fillColor: '#16a34a',
      fillOpacity: 0.08,
      dashArray: '8, 4',
    },
  }).addTo(map);

  markers.addTo(map);
};

const updateMarkers = (newReports) => {
  if (!map) return;
  markers.clearLayers();
  newReports.forEach(report => {
    const lat = parseFloat(report.lat);
    const lng = parseFloat(report.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const marker = L.marker([lat, lng]);
      marker.bindPopup(`<b>${report.jenisSatwa}</b><br>Lokasi: ${report.lokasi}<br>Status: ${report.status}`);
      markers.addLayer(marker);
    }
  });
};

onMounted(() => {
  setupMap();
  updateMarkers(props.reports);
});

watch(() => props.reports, (newReports) => {
  updateMarkers(newReports);
}, { deep: true });
</script>

<template>
  <div ref="mapContainer" style="height: 600px; width: 100%; border-radius: 0.75rem;"></div>
</template>