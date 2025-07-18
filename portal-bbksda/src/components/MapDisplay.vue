<script setup>
import { onMounted, ref, watch } from 'vue';
import L from 'leaflet';

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
  map = L.map(mapContainer.value).setView(riauCenter, 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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