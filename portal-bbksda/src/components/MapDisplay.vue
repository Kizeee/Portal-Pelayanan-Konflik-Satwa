<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import riauBoundary from '@/data/riau-boundary.json'

const props = defineProps({
  reports: { type: Array, required: true },
})

const containerRef = ref(null)
let map = null
let markers = L.layerGroup()

// ── Warna marker per status ──
const statusColor = {
  'Menunggu Verifikasi':  '#F59E0B',
  'pending':              '#F59E0B',
  'Diterima':             '#3B82F6',
  'verified':             '#3B82F6',
  'Penanganan di Lokasi': '#8B5CF6',
  'Diproses':             '#F97316',
  'Selesai':              '#10B981',
  'Ditolak':              '#EF4444',
  'Tidak Valid':          '#EF4444',
}

function getColor(status) {
  return statusColor[status] || '#6B7280'
}

// Custom SVG pin marker berwarna
function createColorMarker(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  })
}

// Popup HTML yang informatif dan rapi
function buildPopupHtml(report) {
  const color = getColor(report.status)
  let dateStr = '-'
  if (report.createdAt) {
    const raw = report.createdAt instanceof Date
      ? report.createdAt
      : (report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt))
    dateStr = raw.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return `
    <div style="font-family:system-ui,sans-serif;min-width:210px;padding:2px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;"></div>
        <strong style="font-size:14px;color:#1f2937;">${report.jenisSatwa || 'Satwa Tidak Diketahui'}</strong>
      </div>
      <table style="width:100%;font-size:12px;border-collapse:collapse;">
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;width:70px;">📍 Lokasi</td>
          <td style="color:#374151;font-weight:500;padding:3px 0;">${report.lokasi || '-'}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">🐾 Kategori</td>
          <td style="color:#374151;padding:3px 0;">${report.kategoriKonflik || '-'}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">📅 Tanggal</td>
          <td style="color:#374151;padding:3px 0;">${dateStr}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">🔖 Status</td>
          <td style="padding:3px 0;">
            <span style="background:${color}22;color:${color};border:1px solid ${color}66;
              padding:1px 8px;border-radius:999px;font-weight:700;font-size:11px;">
              ${report.status}
            </span>
          </td>
        </tr>
      </table>
      ${report.idLaporan
        ? `<div style="margin-top:8px;font-size:10px;color:#d1d5db;border-top:1px solid #f3f4f6;padding-top:6px;">
            ID: ${report.idLaporan}
          </div>`
        : ''}
    </div>`
}

// ── Setup map ──
const setupMap = () => {
  if (!containerRef.value || map) return
  const riauCenter = [0.5104, 101.4383]
  const riauBounds = L.latLngBounds(L.latLng(-0.35, 99.90), L.latLng(2.35, 103.70))

  map = L.map(containerRef.value, {
    maxBounds: riauBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 7,
  }).setView(riauCenter, 8)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  // Batas wilayah Riau
  L.geoJSON(riauBoundary, {
    style: {
      color: '#0e7a3a',
      weight: 2.5,
      opacity: 0.9,
      fillColor: '#16a34a',
      fillOpacity: 0.06,
      dashArray: '8, 4',
    },
  }).addTo(map)

  markers.addTo(map)
}

// ── Update markers ──
const updateMarkers = (newReports) => {
  if (!map) return
  markers.clearLayers()
  newReports.forEach(report => {
    const lat = parseFloat(report.lat)
    const lng = parseFloat(report.lng)
    if (!isNaN(lat) && !isNaN(lng)) {
      const marker = L.marker([lat, lng], { icon: createColorMarker(getColor(report.status)) })
      marker.bindPopup(buildPopupHtml(report), {
        maxWidth: 280,
        className: 'custom-popup',
      })
      markers.addLayer(marker)
    }
  })
}

onMounted(() => {
  setupMap()
  updateMarkers(props.reports)
})

watch(() => props.reports, (newReports) => {
  updateMarkers(newReports)
}, { deep: true })
</script>

<template>
  <div ref="containerRef" class="map-display"></div>
</template>

<style scoped>
.map-display {
  height: 560px;
  width: 100%;
}
</style>

<style>
/* Global — Leaflet popup styling */
.custom-popup .leaflet-popup-content-wrapper {
  border-radius: 14px !important;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15) !important;
  border: 1px solid #e5e7eb !important;
  padding: 2px !important;
}
.custom-popup .leaflet-popup-content {
  margin: 12px 16px !important;
}
.custom-popup .leaflet-popup-tip-container .leaflet-popup-tip {
  background: #fff !important;
  box-shadow: none !important;
}
</style>