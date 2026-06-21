<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '../stores/reports'
import { useUIStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'
import { useReports } from '../composables/useReports'
import { arrayUnion } from 'firebase/firestore'
import Papa from 'papaparse'
import UiSearchBar from '../components/base/UiSearchBar.vue'
import UiCard from '../components/base/UiCard.vue'
import UiBadge from '../components/base/UiBadge.vue'
import UiButton from '../components/base/UiButton.vue'
import UiLoading from '../components/base/UiLoading.vue'

const router = useRouter()
const reportsStore = useReportsStore()
const uiStore = useUIStore()
const authStore = useAuthStore()
const { updateReport } = useReports()

// ===== DETEKSI NOMOR MENCURIGAKAN =====
// Nomor yang mengirim >= 3 laporan dalam 30 hari terakhir dianggap mencurigakan
const SUSPICIOUS_THRESHOLD = 3
const SUSPICIOUS_WINDOW_DAYS = 30
const STATUS_GROUPS = {
  pending: ['Menunggu Verifikasi', 'pending'],
  accepted: ['Diterima', 'verified'],
  process: ['Dalam Proses', 'Tim Menuju Lokasi', 'Penanganan di Lokasi', 'Diproses'],
  completed: ['Selesai'],
  rejected: ['Ditolak', 'Tidak Valid', 'ditolak'],
}

const hasStatus = (report, statuses) => statuses.includes(report.status)
const isPendingReport = (report) => hasStatus(report, STATUS_GROUPS.pending)
const isAcceptedReport = (report) => hasStatus(report, STATUS_GROUPS.accepted)
const isProcessReport = (report) => hasStatus(report, STATUS_GROUPS.process)
const isCompletedReport = (report) => hasStatus(report, STATUS_GROUPS.completed)
const isRejectedReport = (report) => hasStatus(report, STATUS_GROUPS.rejected)

const suspiciousPhones = computed(() => {
  const now = Date.now()
  const windowMs = SUSPICIOUS_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const phoneCounts = {}

  reportsStore.reports.forEach((r) => {
    if (!r.telepon) return
    const createdAt = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt)
    if (now - createdAt.getTime() <= windowMs) {
      phoneCounts[r.telepon] = (phoneCounts[r.telepon] || 0) + 1
    }
  })

  // Kembalikan Set nomor yang mencapai threshold
  return new Set(
    Object.entries(phoneCounts)
      .filter(([, count]) => count >= SUSPICIOUS_THRESHOLD)
      .map(([phone]) => phone)
  )
})

const isSuspicious = (report) => suspiciousPhones.value.has(report.telepon)

// Filter khusus laporan mencurigakan
const showOnlySuspicious = ref(false)

const visibleReports = computed(() => {
  const baseReports = showOnlySuspicious.value
    ? reportsStore.filteredReports.filter((r) => isSuspicious(r))
    : reportsStore.filteredReports

  return baseReports
})

const displayedReports = computed(() => {
  const start = (reportsStore.pagination.currentPage - 1) * reportsStore.pagination.itemsPerPage
  const end = start + reportsStore.pagination.itemsPerPage
  return visibleReports.value.slice(start, end)
})

const visibleTotalPages = computed(() => {
  return Math.max(1, Math.ceil(visibleReports.value.length / reportsStore.pagination.itemsPerPage))
})

const suspiciousCount = computed(() => {
  return reportsStore.reports.filter((r) => isSuspicious(r)).length
})

const reportSummary = computed(() => {
  const reports = reportsStore.filteredReports

  return {
    pending: reports.filter(isPendingReport).length,
    accepted: reports.filter(isAcceptedReport).length,
    process: reports.filter(isProcessReport).length,
    completed: reports.filter(isCompletedReport).length,
    rejected: reports.filter(isRejectedReport).length,
    suspicious: reports.filter((r) => isSuspicious(r)).length,
  }
})

const summaryCards = computed(() => [
  {
    label: 'Menunggu',
    value: reportSummary.value.pending,
    helper: 'Butuh verifikasi',
    iconPath: 'M9 4h6M9 4a2 2 0 0 0-2 2v1h10V6a2 2 0 0 0-2-2M6 7h12v13H6V7ZM9 12h3M9 16h2M15 13v2l1.5 1',
  },
  {
    label: 'Diterima',
    value: reportSummary.value.accepted,
    helper: 'Laporan valid',
    iconPath: 'M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3ZM9 12l2 2 4-4',
  },
  {
    label: 'Proses',
    value: reportSummary.value.process,
    helper: 'Dalam penanganan',
    iconPath: 'M4 13h5l2-8 2 14 2-6h5M4 19h16',
  },
  {
    label: 'Selesai',
    value: reportSummary.value.completed,
    helper: 'Sudah ditutup',
    iconPath: 'M5 5h14v14H5V5ZM8 12l3 3 5-6',
  },
  {
    label: 'Tidak Valid',
    value: reportSummary.value.rejected,
    helper: 'Ditolak admin',
    iconPath: 'M7 3h10l4 4v10l-4 4H7l-4-4V7l4-4ZM9 9l6 6M15 9l-6 6',
  },
  {
    label: 'Mencurigakan',
    value: reportSummary.value.suspicious,
    helper: 'Nomor berulang',
    iconPath: 'M12 9v3m0 4h.01M10.3 4.7 2.9 17.5A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.5L13.7 4.7a2 2 0 0 0-3.4 0Z',
  },
])

// View mode
const viewMode = ref('grid') // grid | list

// Filter panel visibility (mobile)
const showFilters = ref(false)

// Date range presets
const applyDatePreset = (preset) => {
  const now = new Date()
  const dateFrom = new Date()

  switch (preset) {
    case 'this-month':
      dateFrom.setDate(1)
      reportsStore.updateFilters({
        dateFrom,
        dateTo: now,
      })
      break
    case 'last-3-months':
      dateFrom.setMonth(now.getMonth() - 3)
      reportsStore.updateFilters({
        dateFrom,
        dateTo: now,
      })
      break
    case 'last-6-months':
      dateFrom.setMonth(now.getMonth() - 6)
      reportsStore.updateFilters({
        dateFrom,
        dateTo: now,
      })
      break
    case 'this-year':
      dateFrom.setMonth(0, 1)
      reportsStore.updateFilters({
        dateFrom,
        dateTo: now,
      })
      break
  }
}

const toggleSuspiciousFilter = () => {
  showOnlySuspicious.value = !showOnlySuspicious.value
  reportsStore.setPage(1)
}

// Status options
const statusOptions = [
  { value: 'Menunggu Verifikasi', label: 'Menunggu Verifikasi', color: 'warning' },
  { value: 'Diterima', label: 'Diterima', color: 'info' },
  { value: 'Dalam Proses', label: 'Dalam Proses', color: 'info' },
  { value: 'Selesai', label: 'Selesai', color: 'success' },
  { value: 'Ditolak', label: 'Ditolak/Tidak Valid', color: 'error' },
]

// Toggle status filter
const toggleStatus = (status) => {
  const currentStatus = [...reportsStore.filters.status]
  const index = currentStatus.indexOf(status)

  if (index > -1) {
    currentStatus.splice(index, 1)
  } else {
    currentStatus.push(status)
  }

  reportsStore.updateFilters({ status: currentStatus })
}

// Toggle animal type filter
const toggleAnimalType = (type) => {
  const currentTypes = [...reportsStore.filters.animalType]
  const index = currentTypes.indexOf(type)

  if (index > -1) {
    currentTypes.splice(index, 1)
  } else {
    currentTypes.push(type)
  }

  reportsStore.updateFilters({ animalType: currentTypes })
}

// Handle view detail
const handleViewDetail = (reportId) => {
  reportsStore.setSelectedReport(reportId)
  router.push({ name: 'Detail', params: { id: reportId } })
}

// Pagination
const goToPage = (page) => {
  const safePage = Math.min(Math.max(page, 1), visibleTotalPages.value)
  reportsStore.setPage(safePage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const paginationRange = computed(() => {
  const total = visibleTotalPages.value
  const current = reportsStore.pagination.currentPage
  const range = []

  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  return range
})

const canVerify = computed(() => {
  if (!selectedForVerification.value) return false
  return isPendingReport(selectedForVerification.value)
})

const canReject = computed(() => {
  if (!selectedForVerification.value) return false
  return !isCompletedReport(selectedForVerification.value) && !isRejectedReport(selectedForVerification.value)
})

// Format date for display
const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatRupiah = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return new Intl.NumberFormat('id-ID').format(Number(value))
}

// ===== EXPORT CSV =====
const exportCSV = () => {
  let dataToMap = reportsStore.filteredReports
  if (showOnlySuspicious.value) {
    dataToMap = dataToMap.filter(r => isSuspicious(r))
  }

  if (dataToMap.length === 0) {
    uiStore.showNotification('error', 'Gagal', 'Tidak ada data laporan untuk diexport.')
    return
  }

  const dataToExport = dataToMap.map(report => {
    let completedAt = ''
    let updatedBy = ''
    let notes = ''
    
    if (report.statusHistory && report.statusHistory.length > 0) {
      const historyItems = [...report.statusHistory]
      const lastEntry = historyItems[historyItems.length - 1]
      updatedBy = lastEntry.updatedBy || ''
      notes = lastEntry.notes || ''
      
      const selesaiEntry = historyItems.find(h => h.status === 'Selesai')
      if (selesaiEntry) {
        completedAt = formatDate(selesaiEntry.timestamp)
      }
    }

    return {
      'ID Laporan': report.idLaporan || report.id,
      'Nama Pelapor': report.nama,
      'Telepon': report.telepon,
      'Jenis Satwa': report.jenisSatwa,
      'Kategori Konflik': report.kategoriKonflik || '-',
      'Prioritas': report.prioritas || 'Sedang',
      'Lokasi': report.lokasi,
      'Kabupaten/Kota': report.kabupatenKota || '-',
      'Tanggal Kejadian': formatDate(report.tanggal),
      'Tanggal Dilaporkan': formatDate(report.createdAt),
      'Status Laporan': report.status,
      'Estimasi Kerugian': report.estimasi_kerugian ? `Rp ${report.estimasi_kerugian}` : '-',
      'Status Satwa Akhir': report.status_satwa_akhir || '-',
      'Tanggal Selesai': completedAt || '-',
      'Petugas Penanganan': updatedBy || '-',
      'Catatan Admin': notes || '-'
    }
  })

  const csv = Papa.unparse(dataToExport)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Export_Laporan_BBKSDA_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  uiStore.showNotification('success', 'Berhasil', 'Data laporan berhasil diexport ke CSV.')
}

// ===== Verifikasi laporan riset =====
const selectedForVerification = ref(null)
const verificationForm = ref({
  estimasi_kerugian: '',
  status_satwa_akhir: '',
  catatan_admin: '',
})
const isSavingVerification = ref(false)

const openVerification = (report) => {
  selectedForVerification.value = report
  verificationForm.value = {
    estimasi_kerugian: report.estimasi_kerugian ?? '',
    status_satwa_akhir: report.status_satwa_akhir || '',
    catatan_admin: '',
  }
}

const clearVerification = () => {
  selectedForVerification.value = null
  verificationForm.value = {
    estimasi_kerugian: '',
    status_satwa_akhir: '',
    catatan_admin: '',
  }
}

const saveVerification = async (action = 'save') => {
  if (!selectedForVerification.value) return

  const notes = verificationForm.value.catatan_admin?.trim() || ''

  if (action === 'reject' && !notes) {
    uiStore.showNotification('error', 'Catatan diperlukan', 'Isi alasan singkat sebelum menandai laporan tidak valid.')
    return
  }

  isSavingVerification.value = true
  const payload = {
    estimasi_kerugian:
      verificationForm.value.estimasi_kerugian !== '' && !Number.isNaN(Number(verificationForm.value.estimasi_kerugian))
        ? Number(verificationForm.value.estimasi_kerugian)
        : null,
    status_satwa_akhir: verificationForm.value.status_satwa_akhir?.trim() || '',
  }

  if (action === 'accept') {
    payload.status = 'Diterima'
    payload.statusHistory = arrayUnion({
      status: 'Diterima',
      timestamp: new Date(),
      updatedBy: authStore.user?.email || 'Admin',
      notes: notes || 'Laporan telah diverifikasi dan diterima oleh admin.',
    })
  }

  if (action === 'save' && notes) {
    payload.statusHistory = arrayUnion({
      status: selectedForVerification.value.status || 'Menunggu Verifikasi',
      timestamp: new Date(),
      updatedBy: authStore.user?.email || 'Admin',
      notes,
    })
  }

  if (action === 'reject') {
    payload.status = 'Ditolak'
    payload.statusHistory = arrayUnion({
      status: 'Ditolak',
      timestamp: new Date(),
      updatedBy: authStore.user?.email || 'Admin',
      notes,
    })
  }

  try {
    await updateReport(selectedForVerification.value.id, payload)
    await reportsStore.loadReports()

    // refresh selected data dari store terkini
    selectedForVerification.value = reportsStore.reports.find((r) => r.id === selectedForVerification.value.id)
    uiStore.showNotification(
      'success',
      action === 'accept' ? 'Laporan diterima' : action === 'reject' ? 'Laporan ditandai tidak valid' : 'Perubahan disimpan',
      action === 'accept'
        ? 'Status laporan berubah menjadi Diterima.'
        : action === 'reject'
          ? 'Status laporan berubah menjadi Ditolak/Tidak Valid.'
          : 'Data tambahan tersimpan.'
    )
  } catch (error) {
    console.error('Gagal menyimpan verifikasi:', error)
    uiStore.showNotification('error', 'Gagal', 'Tidak dapat menyimpan perubahan verifikasi.')
  } finally {
    isSavingVerification.value = false
  }
}

// Helper untuk warna badge prioritas
const prioritasClass = (p) => {
  const pStr = p || 'Sedang'
  if (pStr === 'Rendah') return 'bg-green-100 text-green-800 border-green-200'
  if (pStr === 'Sedang') return 'bg-orange-100 text-orange-800 border-orange-200'
  if (pStr === 'Tinggi') return 'bg-pink-100 text-pink-800 border-pink-200'
  if (pStr === 'Darurat') return 'bg-red-600 text-white font-bold border-red-700 shadow-sm'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white border border-stone-200 rounded-lg shadow-sm p-5 sm:p-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-4">
          <div class="hidden sm:flex h-12 w-12 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 4h14v16H5V4ZM8 8h8M8 12h8M8 16h5" />
            </svg>
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-stone-800">Kelola Laporan</h2>
            <p class="mt-1 text-sm text-stone-500">
              Menampilkan
              <span class="font-semibold text-stone-800">{{ visibleReports.length }}</span>
              dari {{ reportsStore.reports.length }} laporan
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span class="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1">
                <span class="h-1.5 w-1.5 rounded-full bg-stone-500"></span>
                {{ displayedReports.length }} tampil di halaman ini
              </span>
              <span
                v-if="reportsStore.hasActiveFilters || showOnlySuspicious"
                class="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800"
              >
                Filter aktif
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <button
            @click="exportCSV"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-500 hover:bg-stone-50"
            title="Export data ke CSV"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v10m0 0 3-3m-3 3-3-3M5 20h14" />
            </svg>
            Export CSV
          </button>

          <!-- View Mode Toggle -->
          <div class="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'"
              class="inline-flex h-9 w-10 items-center justify-center rounded-md transition-all"
              title="Tampilan Grid"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'"
              class="inline-flex h-9 w-10 items-center justify-center rounded-md transition-all"
              title="Tampilan Daftar"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ringkasan Status -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="group rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-stone-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-xs font-semibold uppercase tracking-wide text-stone-500">{{ card.label }}</p>
            <p class="mt-1 text-2xl font-extrabold leading-none text-stone-900">{{ card.value }}</p>
          </div>
          <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" :d="card.iconPath" />
            </svg>
          </div>
        </div>
        <p class="mt-3 truncate text-xs text-stone-500">{{ card.helper }}</p>
      </div>
    </div>

    <!-- Filter Panel -->
    <div class="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-stone-800">Filter Laporan</h3>
          <p class="text-xs text-stone-500">Cari dan saring laporan yang perlu ditindaklanjuti.</p>
        </div>
        <button
          @click="showFilters = !showFilters"
          class="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 sm:hidden"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filter
        </button>
      </div>

      <div :class="[showFilters ? 'block' : 'hidden', 'sm:block']">
        <!-- Search Bar -->
        <UiSearchBar
          v-model="reportsStore.filters.search"
          placeholder="Cari ID, nama, lokasi, atau jenis satwa..."
          :result-count="visibleReports.length"
          class="mb-4"
        />

        <!-- Compact Inline Filters -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <!-- Status Filter -->
          <select
            :value="reportsStore.filters.status.length === 1 ? reportsStore.filters.status[0] : ''"
            @change="(e) => reportsStore.updateFilters({ status: e.target.value ? [e.target.value] : [] })"
            class="filter-select w-full"
          >
            <option value="">Semua Status</option>
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>

          <!-- Animal Type Filter -->
          <select
            v-if="reportsStore.animalTypes.length > 0"
            :value="reportsStore.filters.animalType.length === 1 ? reportsStore.filters.animalType[0] : ''"
            @change="(e) => reportsStore.updateFilters({ animalType: e.target.value ? [e.target.value] : [] })"
            class="filter-select w-full"
          >
            <option value="">Semua Jenis Satwa</option>
            <option v-for="type in reportsStore.animalTypes" :key="type" :value="type">{{ type }}</option>
          </select>

          <!-- Prioritas Filter -->
          <select
            :value="reportsStore.filters.prioritas.length === 1 ? reportsStore.filters.prioritas[0] : ''"
            @change="(e) => reportsStore.updateFilters({ prioritas: e.target.value ? [e.target.value] : [] })"
            class="filter-select w-full"
          >
            <option value="">Semua Prioritas</option>
            <option value="Rendah">Rendah</option>
            <option value="Sedang">Sedang</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Darurat">Darurat</option>
          </select>

          <!-- Date Range Preset -->
          <select
            @change="(e) => { if (e.target.value) applyDatePreset(e.target.value) }"
            class="filter-select w-full"
          >
            <option value="">Semua Periode</option>
            <option value="this-month">Bulan Ini</option>
            <option value="last-3-months">3 Bulan Terakhir</option>
            <option value="last-6-months">6 Bulan Terakhir</option>
            <option value="this-year">Tahun Ini</option>
          </select>

          <!-- Sorting -->
          <select v-model="reportsStore.filters.sortBy" class="filter-select w-full">
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="id-asc">ID (A-Z)</option>
            <option value="id-desc">ID (Z-A)</option>
            <option value="status">Status</option>
          </select>

          <!-- Items Per Page -->
          <select
            :value="reportsStore.pagination.itemsPerPage"
            @change="reportsStore.setItemsPerPage(Number($event.target.value))"
            class="filter-select w-full"
          >
            <option :value="12">12 / hal</option>
            <option :value="24">24 / hal</option>
            <option :value="48">48 / hal</option>
          </select>
        </div>

        <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <!-- Filter Mencurigakan -->
          <button
            @click="toggleSuspiciousFilter"
            :class="[
              'inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors',
              showOnlySuspicious
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-red-200 bg-white text-red-700 hover:bg-red-50'
            ]"
            :title="`${suspiciousCount} laporan dari nomor yang mengirim >=${SUSPICIOUS_THRESHOLD}x dalam ${SUSPICIOUS_WINDOW_DAYS} hari`"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 4h.01M10.3 4.7 2.9 17.5A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.5L13.7 4.7a2 2 0 0 0-3.4 0Z" />
            </svg>
            Mencurigakan
            <span
              class="min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-bold"
              :class="showOnlySuspicious ? 'bg-white text-red-700' : 'bg-red-50 text-red-700'"
            >
              {{ suspiciousCount }}
            </span>
          </button>

          <!-- Reset Filters -->
          <button
            v-if="reportsStore.hasActiveFilters || showOnlySuspicious"
            @click="reportsStore.clearFilters(); showOnlySuspicious = false"
            class="filter-reset-btn"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="reportsStore.isLoading" class="rounded-lg border border-stone-200 bg-white py-20 text-center shadow-sm">
      <UiLoading size="lg" />
      <p class="mt-4 text-sm font-medium text-stone-600">Memuat laporan...</p>
    </div>

    <!-- No Results -->
    <div
      v-else-if="visibleReports.length === 0"
      class="rounded-lg border border-stone-200 bg-white px-6 py-20 text-center shadow-sm"
    >
      <svg
        class="mx-auto mb-4 h-16 w-16 text-stone-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 5h16v14H4V5ZM8 9h8M8 13h5M16 17l4 4M20 17l-4 4"
        />
      </svg>
      <p class="mb-2 text-lg font-semibold text-stone-800">Tidak ada laporan ditemukan</p>
      <p class="mb-5 text-sm text-stone-500">Sesuaikan kata kunci atau hapus filter aktif.</p>
      <UiButton @click="reportsStore.clearFilters(); showOnlySuspicious = false" variant="primary">
        Hapus Semua Filter
      </UiButton>
    </div>

    <!-- Grid View -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <UiCard
        v-for="report in displayedReports"
        :key="report.id"
        hoverable
        clickable
        @click="handleViewDetail(report.id)"
        padding="p-0"
        class="h-full overflow-hidden border border-stone-200 bg-white shadow-sm"
        :class="{ 'border-red-200 ring-1 ring-red-100': isSuspicious(report) }"
      >
        <!-- Card Header -->
        <div class="border-b border-stone-100 bg-stone-50/70 px-5 pt-5 pb-4">
          <div class="mb-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-stone-500">ID Laporan</p>
              <h3 class="mt-1 truncate font-mono text-lg font-extrabold leading-none text-stone-900">
                {{ report.idLaporan }}
              </h3>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <UiBadge :status="report.status" size="sm" dot />
              <span :class="prioritasClass(report.prioritas)" class="rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight">
                {{ report.prioritas || 'Sedang' }}
              </span>
            </div>
          </div>

          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-stone-500">Jenis Satwa</p>
            <strong class="mt-1 block text-base font-bold leading-snug text-stone-900">
              {{ report.jenisSatwa || 'Jenis satwa belum diisi' }}
            </strong>
            <p class="mt-0.5 truncate text-sm text-stone-500">{{ report.kategoriKonflik || 'Kategori belum diisi' }}</p>
          </div>

          <div v-if="isSuspicious(report)" class="mt-3">
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
              :title="`Nomor ${report.telepon} telah mengirim ${SUSPICIOUS_THRESHOLD}+ laporan dalam ${SUSPICIOUS_WINDOW_DAYS} hari terakhir`"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 4h.01M10.3 4.7 2.9 17.5A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.5L13.7 4.7a2 2 0 0 0-3.4 0Z" />
              </svg>
              Mencurigakan
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="space-y-3 px-5 py-4">
          <!-- Pelapor & Telepon -->
          <div class="grid grid-cols-2 gap-2">
            <div class="min-w-0 rounded-md border border-stone-100 bg-stone-50/50 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Pelapor</p>
              <div class="mt-0.5 flex items-center gap-1.5">
                <span class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-stone-400">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                  </svg>
                </span>
                <p class="truncate text-sm font-semibold text-stone-800">{{ report.nama || '-' }}</p>
              </div>
            </div>
            <div class="min-w-0 rounded-md border border-stone-100 bg-stone-50/50 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Telepon</p>
              <p class="mt-0.5 truncate text-sm font-semibold text-stone-800">{{ report.telepon || '-' }}</p>
            </div>
          </div>

          <!-- Lokasi -->
          <div class="flex items-start gap-2.5 text-sm text-stone-600">
            <span class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-stone-500">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-4.7 7-11a7 7 0 1 0-14 0c0 6.3 7 11 7 11ZM12 10.5h.01" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="line-clamp-2 text-sm leading-snug text-stone-700">{{ report.lokasi || 'Tidak ada lokasi' }}</p>
              <p v-if="report.kabupatenKota" class="mt-0.5 text-xs text-stone-400">{{ report.kabupatenKota }}</p>
            </div>
          </div>

          <!-- Tanggal Dilaporkan -->
          <div class="flex items-center gap-2.5 text-sm text-stone-500">
            <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-stone-500">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
              </svg>
            </span>
            <span class="truncate">{{ formatDate(report.createdAt) || '-' }}</span>
          </div>

          <!-- Deskripsi singkat -->
          <div v-if="report.deskripsi" class="rounded-md border border-stone-100 bg-stone-50/50 px-3 py-2">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Deskripsi</p>
            <p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-stone-600">{{ report.deskripsi }}</p>
          </div>

          <!-- Estimasi Kerugian & Status Satwa -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
            <span v-if="report.estimasi_kerugian || report.estimasi_kerugian === 0" class="inline-flex items-center gap-1">
              <svg class="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Rp {{ formatRupiah(report.estimasi_kerugian) }}</span>
            </span>
            <span v-if="report.status_satwa_akhir" class="inline-flex items-center gap-1">
              <svg class="h-3.5 w-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12l4 4L19 6" />
              </svg>
              <span class="truncate max-w-[10rem]">{{ report.status_satwa_akhir }}</span>
            </span>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="grid grid-cols-2 gap-3 border-t border-stone-100 bg-stone-50 p-4">
          <UiButton variant="outline" size="sm" @click.stop="openVerification(report)" class="bg-white">
            Periksa
          </UiButton>
          <UiButton variant="primary" size="sm" @click.stop="handleViewDetail(report.id)">
            Lihat Detail
          </UiButton>
        </div>
      </UiCard>
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div class="flex flex-col gap-2 border-b border-stone-200 bg-stone-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-sm font-bold text-stone-800">Daftar Laporan</h3>
          <p class="text-xs text-stone-500">{{ displayedReports.length }} laporan pada halaman ini</p>
        </div>
        <span class="text-xs font-medium text-stone-500">
          Urut: {{ reportsStore.filters.sortBy }}
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-stone-100">
          <thead class="bg-white">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                Laporan
              </th>
              <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                Pelapor
              </th>
              <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                Jenis Satwa
              </th>
              <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                Kategori
              </th>
              <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                Lokasi
              </th>
              <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                Tanggal
              </th>
              <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                Prioritas
              </th>
              <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                Status
              </th>
              <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-stone-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-stone-100">
            <tr
              v-for="report in displayedReports"
              :key="report.id"
              class="cursor-pointer transition-colors hover:bg-stone-50"
              :class="{ 'bg-red-50/40': isSuspicious(report) }"
              @click="handleViewDetail(report.id)"
            >
              <td class="whitespace-nowrap px-5 py-4">
                <p class="font-mono text-sm font-bold text-stone-900">{{ report.idLaporan }}</p>
                <p class="mt-1 text-xs text-stone-500">{{ report.kabupatenKota || '-' }}</p>
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-sm text-stone-800">
                <div class="flex max-w-[14rem] items-center gap-2">
                  <span class="truncate font-semibold">{{ report.nama || '-' }}</span>
                  <span
                    v-if="isSuspicious(report)"
                    class="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                    :title="`Nomor ${report.telepon} telah mengirim ${SUSPICIOUS_THRESHOLD}+ laporan dalam ${SUSPICIOUS_WINDOW_DAYS} hari`"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 4h.01M10.3 4.7 2.9 17.5A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.5L13.7 4.7a2 2 0 0 0-3.4 0Z" />
                    </svg>
                    !
                  </span>
                </div>
                <p class="mt-1 text-xs text-stone-500">{{ report.telepon || '-' }}</p>
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-sm font-semibold text-stone-800">
                {{ report.jenisSatwa || '-' }}
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-sm text-stone-600">
                {{ report.kategoriKonflik || '-' }}
              </td>
              <td class="max-w-xs px-5 py-4 text-sm text-stone-600">
                <span class="line-clamp-2">{{ report.lokasi || '-' }}</span>
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-sm text-stone-500">
                {{ formatDate(report.createdAt) }}
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-sm">
                <span :class="prioritasClass(report.prioritas)" class="rounded-full border px-2.5 py-1 text-xs font-semibold">
                  {{ report.prioritas || 'Sedang' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-5 py-4">
                <UiBadge :status="report.status" size="sm" />
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-right text-sm">
                <div class="inline-flex items-center gap-2">
                  <button
                    @click.stop="openVerification(report)"
                    class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:border-stone-500 hover:bg-stone-50"
                  >
                    Periksa
                  </button>
                  <button
                    @click.stop="handleViewDetail(report.id)"
                    class="rounded-md bg-forest-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-700"
                  >
                    Detail
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Popup Verifikasi Admin Riset -->
    <div
      v-if="selectedForVerification"
      class="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-stone-950/60 p-4 pt-[calc(1rem_+_env(safe-area-inset-top))] pb-[calc(1rem_+_env(safe-area-inset-bottom))] backdrop-blur-sm transition-opacity md:items-center"
      @click="clearVerification"
    >
      <div 
        class="flex max-h-[calc(100dvh_-_2rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] w-full max-w-5xl transform flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-2xl transition-all md:flex-row"
        @click.stop
      >
        <!-- Info Column -->
        <div class="flex flex-col border-b border-stone-200 bg-stone-50 p-6 md:w-[45%] md:border-b-0 md:border-r md:p-8">
          <div class="mb-6 flex items-start gap-3">
            <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 4h14v16H5V4ZM8 8h8M8 12h8M8 16h5" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-stone-500">Verifikasi Laporan</p>
              <h4 class="mt-1 truncate font-mono text-2xl font-extrabold text-stone-900">{{ selectedForVerification.idLaporan }}</h4>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <UiBadge :status="selectedForVerification.status" size="sm" />
                <span :class="prioritasClass(selectedForVerification.prioritas)" class="rounded-full border px-2.5 py-1 text-xs font-semibold">
                  {{ selectedForVerification.prioritas || 'Sedang' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="space-y-4 overflow-y-auto pr-1">
            <div class="rounded-lg border border-stone-200 bg-white p-4">
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Jenis Satwa</p>
              <p class="font-bold text-stone-900">{{ selectedForVerification.jenisSatwa || '-' }}</p>
              <p class="mt-1 text-sm text-stone-500">{{ selectedForVerification.kategoriKonflik || 'Kategori belum diisi' }}</p>
            </div>
            
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="rounded-lg border border-stone-200 bg-white p-4">
                 <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Pelapor</p>
                 <p class="truncate font-semibold text-stone-900">{{ selectedForVerification.nama || '-' }}</p>
              </div>
              <div class="rounded-lg border border-stone-200 bg-white p-4">
                 <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Tanggal</p>
                 <p class="font-semibold text-stone-900">{{ formatDate(selectedForVerification.createdAt) || '-' }}</p>
              </div>
            </div>

            <div class="rounded-lg border border-stone-200 bg-white p-4">
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Lokasi</p>
              <p class="text-sm leading-relaxed text-stone-700">{{ selectedForVerification.lokasi || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Form Column -->
        <div class="relative overflow-y-auto bg-white p-6 md:w-[55%] md:p-8">
          <button @click="clearVerification" class="absolute right-4 top-4 rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div class="mb-6 pr-10">
            <h4 class="text-xl font-bold text-stone-900">Tindakan Admin</h4>
            <p class="mt-1 text-sm text-stone-500">Lengkapi hasil pemeriksaan sebelum menerima atau menolak laporan.</p>
          </div>
          
          <form @submit.prevent="saveVerification('save')" class="space-y-6 flex flex-col h-full">
            <div class="space-y-4">
              <div>
                <label for="estimasi" class="mb-2 block text-sm font-semibold text-stone-700">Estimasi Kerugian (Rp)</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-4 font-semibold text-stone-500">Rp</span>
                  <input
                    id="estimasi"
                    type="number"
                    min="0"
                    v-model="verificationForm.estimasi_kerugian"
                    class="w-full rounded-md border border-stone-300 py-3 pl-12 pr-4 transition-colors focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                    placeholder="Contoh: 5000000"
                  />
                </div>
              </div>
              
              <div>
                <label for="status-satwa" class="mb-2 block text-sm font-semibold text-stone-700">Status Satwa Akhir</label>
                <input
                  id="status-satwa"
                  type="text"
                  v-model="verificationForm.status_satwa_akhir"
                  class="w-full rounded-md border border-stone-300 px-4 py-3 transition-colors focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  placeholder="Misal: Dievakuasi ke pusat rehabilitasi"
                />
              </div>

              <div>
                <label for="catatan-admin" class="mb-2 block text-sm font-semibold text-stone-700">Catatan Admin</label>
                <textarea
                  id="catatan-admin"
                  rows="3"
                  v-model="verificationForm.catatan_admin"
                  class="w-full resize-none rounded-md border border-stone-300 px-4 py-3 transition-colors focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  placeholder="Contoh: data sudah dikonfirmasi melalui telepon, atau alasan laporan tidak valid"
                ></textarea>
              </div>
            </div>

            <div class="mt-auto grid grid-cols-1 gap-3 border-t border-stone-100 pt-5 sm:grid-cols-3">
              <UiButton
                type="button"
                variant="primary"
                :disabled="!canVerify || isSavingVerification"
                @click="saveVerification('accept')"
                class="justify-center py-3"
              >
                {{ isSavingVerification ? 'Memproses...' : 'Terima / Verifikasi' }}
              </UiButton>
              <UiButton 
                type="submit" 
                variant="outline" 
                :loading="isSavingVerification"
                class="justify-center py-3"
              >
                Simpan Catatan
              </UiButton>
              <UiButton
                type="button"
                variant="danger"
                :disabled="!canReject || isSavingVerification"
                @click="saveVerification('reject')"
                class="justify-center py-3"
              >
                Tidak Valid
              </UiButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="visibleTotalPages > 1"
      class="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-sm text-stone-600">
        Menampilkan
        <span class="font-semibold text-stone-900">{{ ((reportsStore.pagination.currentPage - 1) * reportsStore.pagination.itemsPerPage) + 1 }}</span>
        -
        <span class="font-semibold text-stone-900">{{ Math.min(reportsStore.pagination.currentPage * reportsStore.pagination.itemsPerPage, visibleReports.length) }}</span>
        dari <span class="font-semibold text-stone-900">{{ visibleReports.length }}</span> laporan
      </p>

      <div class="flex flex-wrap items-center gap-1.5">
        <!-- Previous Button -->
        <button
          @click="goToPage(reportsStore.pagination.currentPage - 1)"
          :disabled="reportsStore.pagination.currentPage === 1"
          class="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sebelumnya
        </button>

        <!-- Page Numbers -->
        <button
          v-for="page in paginationRange"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            page === reportsStore.pagination.currentPage
              ? 'bg-forest-600 text-white'
              : 'border border-stone-300 text-stone-600 hover:bg-stone-50',
          ]"
        >
          {{ page }}
        </button>

        <!-- Next Button -->
        <button
          @click="goToPage(reportsStore.pagination.currentPage + 1)"
          :disabled="reportsStore.pagination.currentPage === visibleTotalPages"
          class="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  </div>
</template>
