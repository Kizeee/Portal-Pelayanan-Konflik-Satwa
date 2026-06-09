<script setup>
import { ref, computed, watch } from 'vue'
import { useReportsStore } from '../stores/reports'
import MapDisplay from '../components/MapDisplay.vue'

const reportsStore = useReportsStore()

// Filter state
const filterStatus    = ref('semua')
const filterSatwa     = ref('semua')
const filterPrioritas = ref('semua')
const viewMode        = ref('marker') // 'marker' or 'heatmap'

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
    const prioritasOk = filterPrioritas.value === 'semua' || (r.prioritas || 'Sedang') === filterPrioritas.value
    return statusOk && satwaOk && prioritasOk
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
        <div class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 21s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z" />
            <path d="M12 13.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
          </svg>
        </div>
        <div>
          <p class="card-num">{{ total }}</p>
          <p class="card-lbl">Total Titik</p>
        </div>
      </div>
      <div class="summary-card card-menunggu">
        <div class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 1.8" />
          </svg>
        </div>
        <div>
          <p class="card-num">{{ menunggu }}</p>
          <p class="card-lbl">Menunggu</p>
        </div>
      </div>
      <div class="summary-card card-diproses">
        <div class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 17.5c1.9-4.2 4.2-6.3 7-6.3 1.5 0 2.7.6 3.8 1.7" />
            <path d="M15.2 8.2h4.1v4.1" />
            <path d="M19.1 8.4 14.8 13" />
            <path d="M5 19h14" />
          </svg>
        </div>
        <div>
          <p class="card-num">{{ diproses }}</p>
          <p class="card-lbl">Diproses</p>
        </div>
      </div>
      <div class="summary-card card-selesai">
        <div class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8.5" />
            <path d="m8.2 12.2 2.4 2.4 5.2-5.4" />
          </svg>
        </div>
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

        <!-- View Mode -->
        <div class="side-section">
          <h3 class="side-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Mode Tampilan
          </h3>
          <div class="view-mode-toggle">
            <button :class="{ active: viewMode === 'marker' }" @click="viewMode = 'marker'" class="mode-btn">
              📍 Marker
            </button>
            <button :class="{ active: viewMode === 'heatmap' }" @click="viewMode = 'heatmap'" class="mode-btn">
              🔥 Heatmap
            </button>
          </div>
        </div>

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

          <label class="filter-label mt-3">Prioritas</label>
          <select v-model="filterPrioritas" class="filter-select">
            <option value="semua">Semua Prioritas</option>
            <option value="Rendah">Rendah</option>
            <option value="Sedang">Sedang</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Darurat">Darurat</option>
          </select>

          <button
            v-if="filterStatus !== 'semua' || filterSatwa !== 'semua' || filterPrioritas !== 'semua'"
            @click="filterStatus = 'semua'; filterSatwa = 'semua'; filterPrioritas = 'semua'"
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
            <p v-if="viewMode === 'heatmap'" class="empty-title">Belum ada data konflik untuk ditampilkan pada heatmap.</p>
            <p v-else class="empty-title">Tidak ada titik laporan</p>
            <p class="empty-sub">Coba ubah filter untuk menampilkan data</p>
          </div>
        </div>
        <MapDisplay :reports="filteredReports" :viewMode="viewMode" />
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
  box-shadow: 0 3px 12px rgba(15,23,42,0.09);
  transition: transform 0.2s;
}
.summary-card:hover { transform: translateY(-2px); }
.card-total    { background: linear-gradient(135deg, #315f49, #6f9f83); }
.card-menunggu { background: linear-gradient(135deg, #8a6330, #c39a4d); }
.card-diproses { background: linear-gradient(135deg, #4f5f7a, #7890ad); }
.card-selesai  { background: linear-gradient(135deg, #376f68, #76a99f); }
.card-icon {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: rgba(255,255,255,0.11);
  border: 1px solid rgba(255,255,255,0.16);
}
.card-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.9;
}
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

.view-mode-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 0.25rem;
  gap: 0.25rem;
}
.mode-btn {
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.mode-btn:hover { color: #374151; }
.mode-btn.active {
  background: #fff;
  color: #0e7a3a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

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
