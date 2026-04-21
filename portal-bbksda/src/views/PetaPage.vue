<script setup>
import { ref, computed, watch } from 'vue'
import { useReportsStore } from '../stores/reports'
import MapDisplay from '../components/MapDisplay.vue'

const reportsStore = useReportsStore()

// Filter state
const filterStatus = ref('semua')
const filterSatwa  = ref('semua')

// Unique animal types from reports
const jenisSatwaList = computed(() => {
  const set = new Set(reportsStore.reportsWithCoords.map(r => r.jenisSatwa).filter(Boolean))
  return Array.from(set).sort()
})

// Filtered reports passed to map
const filteredReports = computed(() => {
  return reportsStore.reportsWithCoords.filter(r => {
    const statusOk = filterStatus.value === 'semua' || r.status === filterStatus.value
    const satwaOk  = filterSatwa.value  === 'semua' || r.jenisSatwa === filterSatwa.value
    return statusOk && satwaOk
  })
})

// Summary counts
const total      = computed(() => filteredReports.value.length)
const selesai    = computed(() => filteredReports.value.filter(r => r.status === 'Selesai').length)
const diproses   = computed(() => filteredReports.value.filter(r =>
  ['Penanganan di Lokasi', 'Diproses'].includes(r.status)).length)
const menunggu   = computed(() => filteredReports.value.filter(r =>
  ['Menunggu Verifikasi', 'pending'].includes(r.status)).length)

const statusOptions = [
  { value: 'semua',                label: 'Semua Status' },
  { value: 'Menunggu Verifikasi',  label: 'Menunggu Verifikasi' },
  { value: 'Diterima',             label: 'Diterima' },
  { value: 'Penanganan di Lokasi', label: 'Penanganan di Lokasi' },
  { value: 'Diproses',             label: 'Diproses' },
  { value: 'Selesai',              label: 'Selesai' },
  { value: 'Ditolak',              label: 'Ditolak' },
]
</script>

<template>
  <div class="peta-wrapper">

    <!-- ── PAGE HEADER ── -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Peta Sebaran Konflik Satwa</h2>
        <p class="page-subtitle">Visualisasi lokasi laporan konflik satwa di wilayah BBKSDA Riau</p>
      </div>
      <div class="header-badge">
        <span class="dot-pulse"></span>
        Live Data
      </div>
    </div>

    <!-- ── SUMMARY CARDS ── -->
    <div class="summary-grid">
      <div class="summary-card card-total">
        <div class="card-icon">📋</div>
        <div>
          <p class="card-num">{{ total }}</p>
          <p class="card-lbl">Total Titik</p>
        </div>
      </div>
      <div class="summary-card card-menunggu">
        <div class="card-icon">⏳</div>
        <div>
          <p class="card-num">{{ menunggu }}</p>
          <p class="card-lbl">Menunggu</p>
        </div>
      </div>
      <div class="summary-card card-diproses">
        <div class="card-icon">🚨</div>
        <div>
          <p class="card-num">{{ diproses }}</p>
          <p class="card-lbl">Diproses</p>
        </div>
      </div>
      <div class="summary-card card-selesai">
        <div class="card-icon">✅</div>
        <div>
          <p class="card-num">{{ selesai }}</p>
          <p class="card-lbl">Selesai</p>
        </div>
      </div>
    </div>

    <!-- ── MAP + SIDEBAR LAYOUT ── -->
    <div class="map-layout">

      <!-- Sidebar filter + legend -->
      <aside class="sidebar">

        <!-- Filter -->
        <div class="side-section">
          <h3 class="side-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
            Filter
          </h3>

          <label class="filter-label">Status Laporan</label>
          <select v-model="filterStatus" class="filter-select">
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>

          <label class="filter-label mt-3">Jenis Satwa</label>
          <select v-model="filterSatwa" class="filter-select">
            <option value="semua">Semua Satwa</option>
            <option v-for="satwa in jenisSatwaList" :key="satwa" :value="satwa">{{ satwa }}</option>
          </select>

          <button
            v-if="filterStatus !== 'semua' || filterSatwa !== 'semua'"
            @click="filterStatus = 'semua'; filterSatwa = 'semua'"
            class="reset-btn"
          >
            ↺ Reset Filter
          </button>
        </div>

        <!-- Legend -->
        <div class="side-section">
          <h3 class="side-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"/></svg>
            Legenda
          </h3>
          <ul class="legend-list">
            <li><span class="legend-dot" style="background:#F59E0B"></span>Menunggu Verifikasi</li>
            <li><span class="legend-dot" style="background:#3B82F6"></span>Diterima</li>
            <li><span class="legend-dot" style="background:#8B5CF6"></span>Penanganan di Lokasi</li>
            <li><span class="legend-dot" style="background:#F97316"></span>Diproses</li>
            <li><span class="legend-dot" style="background:#10B981"></span>Selesai</li>
            <li><span class="legend-dot" style="background:#EF4444"></span>Ditolak</li>
          </ul>
        </div>
      </aside>

      <!-- Map container -->
      <div class="map-container">
        <div v-if="filteredReports.length === 0" class="empty-overlay">
          <div class="empty-box">
            <span class="empty-icon">🗺️</span>
            <p class="empty-title">Tidak ada titik laporan</p>
            <p class="empty-sub">Coba ubah filter untuk menampilkan data</p>
          </div>
        </div>
        <MapDisplay :reports="filteredReports" />
        <div class="map-count-badge">
          {{ filteredReports.length }} titik ditampilkan
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper ── */
.peta-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a3c2e;
}
.page-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.2rem;
}
.header-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #d1fae5;
  color: #065f46;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid #6ee7b7;
}
.dot-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 1.5s infinite;
  display: inline-block;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .5; transform: scale(1.4); }
}

/* ── Summary Cards ── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 768px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}
.summary-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.12);
  transition: transform 0.2s;
}
.summary-card:hover { transform: translateY(-3px); }
.card-total    { background: linear-gradient(135deg, #2d6a4f, #52b788); }
.card-menunggu { background: linear-gradient(135deg, #b45309, #fbbf24); }
.card-diproses { background: linear-gradient(135deg, #6d28d9, #a78bfa); }
.card-selesai  { background: linear-gradient(135deg, #0f766e, #2dd4bf); }
.card-icon { font-size: 1.6rem; }
.card-num  { font-size: 1.6rem; font-weight: 800; line-height: 1; }
.card-lbl  { font-size: 0.75rem; opacity: 0.88; margin-top: 0.15rem; font-weight: 600; }

/* ── Map Layout ── */
.map-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.25rem;
  align-items: start;
}
@media (max-width: 900px) {
  .map-layout { grid-template-columns: 1fr; }
}

/* ── Sidebar ── */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.side-section {
  background: #fff;
  border-radius: 14px;
  padding: 1rem 1.1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  border: 1px solid #e5e7eb;
}
.side-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.icon { width: 15px; height: 15px; color: #386641; }

.filter-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.3rem;
}
.mt-3 { margin-top: 0.75rem; }
.filter-select {
  width: 100%;
  padding: 0.45rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.8rem;
  background: #f9fafb;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s;
}
.filter-select:focus { border-color: #386641; }
.reset-btn {
  margin-top: 0.75rem;
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.reset-btn:hover { background: #fee2e2; }

.legend-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.45rem; }
.legend-list li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #374151; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
/* ── Map ── */
.map-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  border: 1px solid #e5e7eb;
}
.map-count-badge {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 30, 30, 0.78);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 1rem;
  border-radius: 999px;
  pointer-events: none;
  z-index: 999;
}
.empty-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-box { text-align: center; }
.empty-icon { font-size: 3rem; }
.empty-title { font-weight: 700; color: #1f2937; margin-top: 0.5rem; }
.empty-sub { font-size: 0.82rem; color: #6b7280; margin-top: 0.25rem; }
</style>