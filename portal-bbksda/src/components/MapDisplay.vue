<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'

// Ensure L is globally available for plugins
window.L = L
import 'leaflet.heat'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'

import riauBoundary from '@/data/riau-boundary.json'

const props = defineProps({
  reports: { type: Array, required: true },
  viewMode: { type: String, default: 'marker' }
})

const containerRef = ref(null)
let map = null
let markers = null // initialized in setupMap
let heatLayer = null
const boundaryStyle = {
  color: '#ef5b3f',
  weight: 3,
  opacity: 0.95,
  fillOpacity: 0,
  dashArray: '1, 8',
  lineCap: 'round',
  lineJoin: 'round',
}

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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
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
  const jenisSatwa = escapeHtml(report.jenisSatwa || 'Satwa Tidak Diketahui')
  const lokasi = escapeHtml(report.lokasi || '-')
  const kategoriKonflik = escapeHtml(report.kategoriKonflik || '-')
  const status = escapeHtml(report.status || '-')
  const idLaporan = escapeHtml(report.idLaporan || '')
  const kabupatenKota = escapeHtml(report.kabupatenKota || '-')
  const kecamatan = escapeHtml(report.kecamatan || '-')
  const kelurahan = escapeHtml(report.kelurahan || '-')
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
        <strong style="font-size:14px;color:#1f2937;">${jenisSatwa}</strong>
      </div>
      <table style="width:100%;font-size:12px;border-collapse:collapse;">
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;width:86px;">Wilayah</td>
          <td style="color:#374151;font-weight:600;padding:3px 0;">${kabupatenKota}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">Kecamatan</td>
          <td style="color:#374151;padding:3px 0;">${kecamatan}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">Kel/Desa</td>
          <td style="color:#374151;padding:3px 0;">${kelurahan}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">Lokasi</td>
          <td style="color:#374151;font-weight:500;padding:3px 0;">${lokasi}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">Kategori</td>
          <td style="color:#374151;padding:3px 0;">${kategoriKonflik}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">Tanggal</td>
          <td style="color:#374151;padding:3px 0;">${dateStr}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;padding:3px 0;vertical-align:top;">Status</td>
          <td style="padding:3px 0;">
            <span style="background:${color}22;color:${color};border:1px solid ${color}66;
              padding:1px 8px;border-radius:999px;font-weight:700;font-size:11px;">
              ${status}
            </span>
          </td>
        </tr>
      </table>
      ${report.idLaporan
        ? `<div style="margin-top:8px;font-size:10px;color:#d1d5db;border-top:1px solid #f3f4f6;padding-top:6px;">
            ID: ${idLaporan}
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
    style: boundaryStyle,
    interactive: false,
  }).addTo(map)

  // Initialize marker cluster group
  markers = L.markerClusterGroup({
    chunkedLoading: true,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 50
  })
  markers.addTo(map)
}

// ── Update layers (Markers or Heatmap) ──
const updateLayers = () => {
  if (!map || !markers) return
  
  // Bersihkan layer yang ada
  markers.clearLayers()
  if (heatLayer) {
    map.removeLayer(heatLayer)
    heatLayer = null
  }

  // Filter laporan dengan koordinat valid
  const validReports = props.reports.filter(r => {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lng)
    return !isNaN(lat) && !isNaN(lng)
  })

  if (props.viewMode === 'heatmap') {
    // Mode Heatmap
    const heatData = validReports.map(r => [parseFloat(r.lat), parseFloat(r.lng), 1]) // intensity 1 per report
    heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 14,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(map)
  } else {
    // Mode Marker
    validReports.forEach(report => {
      const lat = parseFloat(report.lat)
      const lng = parseFloat(report.lng)
      const marker = L.marker([lat, lng], { icon: createColorMarker(getColor(report.status)) })
      marker.bindPopup(buildPopupHtml(report), {
        maxWidth: 280,
        className: 'custom-popup',
      })
      markers.addLayer(marker)
    })
  }
}

onMounted(() => {
  setupMap()
  updateLayers()
})

watch(() => props.reports, () => {
  updateLayers()
}, { deep: true })

watch(() => props.viewMode, () => {
  updateLayers()
})
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
