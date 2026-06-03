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
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-brand-green mb-1 sm:mb-2">Kelola Laporan</h2>
        <p class="text-gray-600 text-sm sm:text-base">
          Menampilkan
          <span class="font-semibold text-primary-600">{{ visibleReports.length }}</span>
          dari {{ reportsStore.reports.length }} laporan
        </p>
      </div>

      <!-- View Mode Toggle (Desktop) -->
      <div class="hidden sm:flex items-center space-x-2">
        <button
          @click="viewMode = 'grid'"
          :class="viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          class="px-4 py-2 rounded-md transition-colors border"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          @click="viewMode = 'list'"
          :class="viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          class="px-4 py-2 rounded-md transition-colors border"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Ringkasan Status -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Menunggu</p>
        <p class="mt-1 text-2xl font-bold text-yellow-700">{{ reportSummary.pending }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Diterima</p>
        <p class="mt-1 text-2xl font-bold text-blue-700">{{ reportSummary.accepted }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Proses</p>
        <p class="mt-1 text-2xl font-bold text-indigo-700">{{ reportSummary.process }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Selesai</p>
        <p class="mt-1 text-2xl font-bold text-green-700">{{ reportSummary.completed }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tidak Valid</p>
        <p class="mt-1 text-2xl font-bold text-red-700">{{ reportSummary.rejected }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mencurigakan</p>
        <p class="mt-1 text-2xl font-bold text-gray-800">{{ reportSummary.suspicious }}</p>
      </div>
    </div>

    <!-- Filter Panel -->
    <UiCard class="mb-6" variant="outlined" padding="p-5">
      <!-- Search Bar -->
      <UiSearchBar
        v-model="reportsStore.filters.search"
        placeholder="Cari berdasarkan ID, nama, lokasi, jenis satwa..."
        :result-count="visibleReports.length"
        class="mb-4"
      />

      <!-- Compact Inline Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Status Filter -->
        <select
          :value="reportsStore.filters.status.length === 1 ? reportsStore.filters.status[0] : ''"
          @change="(e) => reportsStore.updateFilters({ status: e.target.value ? [e.target.value] : [] })"
          class="filter-select"
        >
          <option value="">Semua Status</option>
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>

        <!-- Animal Type Filter -->
        <select
          v-if="reportsStore.animalTypes.length > 0"
          :value="reportsStore.filters.animalType.length === 1 ? reportsStore.filters.animalType[0] : ''"
          @change="(e) => reportsStore.updateFilters({ animalType: e.target.value ? [e.target.value] : [] })"
          class="filter-select"
        >
          <option value="">Semua Jenis Satwa</option>
          <option v-for="type in reportsStore.animalTypes" :key="type" :value="type">{{ type }}</option>
        </select>

        <!-- Prioritas Filter -->
        <select
          :value="reportsStore.filters.prioritas.length === 1 ? reportsStore.filters.prioritas[0] : ''"
          @change="(e) => reportsStore.updateFilters({ prioritas: e.target.value ? [e.target.value] : [] })"
          class="filter-select"
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
          class="filter-select"
        >
          <option value="">Semua Periode</option>
          <option value="this-month">Bulan Ini</option>
          <option value="last-3-months">3 Bulan Terakhir</option>
          <option value="last-6-months">6 Bulan Terakhir</option>
          <option value="this-year">Tahun Ini</option>
        </select>

        <!-- Sorting -->
        <select v-model="reportsStore.filters.sortBy" class="filter-select">
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
          class="filter-select"
        >
          <option :value="12">12 / hal</option>
          <option :value="24">24 / hal</option>
          <option :value="48">48 / hal</option>
        </select>

        <!-- Spacer to push reset button right -->
        <div class="flex-grow"></div>

        <!-- Filter Mencurigakan -->
        <button
          @click="toggleSuspiciousFilter"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border transition-colors',
            showOnlySuspicious
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
          ]"
          :title="`${suspiciousCount} laporan dari nomor yang mengirim >=${SUSPICIOUS_THRESHOLD}x dalam ${SUSPICIOUS_WINDOW_DAYS} hari`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Mencurigakan
          <span class="bg-white text-red-600 text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center" :class="{ 'bg-red-100': !showOnlySuspicious }">
            {{ suspiciousCount }}
          </span>
        </button>

        <!-- Export CSV -->
        <button
          @click="exportCSV"
          class="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border transition-colors bg-white text-brand-green border-gray-300 hover:border-brand-green hover:bg-primary-50"
          title="Export data ke CSV"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
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
    </UiCard>

    <!-- Loading State -->
    <div v-if="reportsStore.isLoading" class="text-center py-20">
      <UiLoading size="lg" />
      <p class="mt-4 text-gray-600">Memuat laporan...</p>
    </div>

    <!-- No Results -->
    <div
      v-else-if="visibleReports.length === 0"
      class="text-center py-20 bg-gray-50 rounded-lg border border-gray-200"
    >
      <svg
        class="mx-auto h-24 w-24 text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-xl font-semibold text-gray-700 mb-2">Tidak ada laporan ditemukan</p>
      <p class="text-gray-500 mb-4">Coba sesuaikan filter pencarian</p>
      <UiButton @click="reportsStore.clearFilters(); showOnlySuspicious = false" variant="primary">
        Hapus Semua Filter
      </UiButton>
    </div>

    <!-- Grid View -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <UiCard
        v-for="report in displayedReports"
        :key="report.id"
        hoverable
        clickable
        @click="handleViewDetail(report.id)"
        padding="p-0"
        class="h-full overflow-hidden border border-gray-200"
        :class="{ 'ring-1 ring-red-200 border-red-200': isSuspicious(report) }"
      >
        <div class="p-5 pb-4">
        <div class="flex justify-between items-start gap-3 mb-4">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">ID Laporan</p>
            <h3 class="mt-1 text-xl font-bold text-primary-700 font-mono leading-none">{{ report.idLaporan }}</h3>
            <!-- Flag mencurigakan -->
            <span
              v-if="isSuspicious(report)"
              class="mt-3 inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200"
              :title="`Nomor ${report.telepon} telah mengirim ${SUSPICIOUS_THRESHOLD}+ laporan dalam ${SUSPICIOUS_WINDOW_DAYS} hari terakhir`"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Mencurigakan
            </span>
          </div>
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <span :class="prioritasClass(report.prioritas)" class="text-xs px-2.5 py-1 rounded-full border font-semibold">
              {{ report.prioritas || 'Sedang' }}
            </span>
            <UiBadge :status="report.status" size="sm" dot />
          </div>
        </div>

        <div class="space-y-3 text-sm text-gray-600">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Jenis Satwa</p>
            <strong class="mt-1 block text-lg leading-snug font-bold text-gray-900">{{ report.jenisSatwa }}</strong>
          </div>

          <div class="flex items-center text-gray-600">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 12h10M7 17h10" />
            </svg>
            <span>Kategori: {{ report.kategoriKonflik || '-' }}</span>
          </div>

          <div class="flex items-start text-gray-600">
            <svg class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{{ report.lokasi || 'Tidak ada lokasi' }}</span>
          </div>

          <div class="flex items-center text-gray-600">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{{ formatDate(report.createdAt) }}</span>
          </div>

          <div
            v-if="report.estimasi_kerugian || report.estimasi_kerugian === 0"
            class="flex items-center text-gray-600"
          >
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .843-3 1.882 0 1.04 1.343 1.883 3 1.883s3 .842 3 1.883C15 14.157 13.657 15 12 15m0-7v7m0 4v-4"
              />
            </svg>
            <span>Estimasi kerugian: Rp {{ formatRupiah(report.estimasi_kerugian) }}</span>
          </div>

          <div v-if="report.status_satwa_akhir" class="flex items-center text-gray-600">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Status satwa akhir: {{ report.status_satwa_akhir }}</span>
          </div>

          <div class="flex items-center text-gray-600">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span class="truncate">{{ report.nama }}</span>
          </div>
        </div>

        </div>

        <div class="grid grid-cols-2 gap-3 border-t border-gray-100 bg-gray-50 p-4">
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
    <div v-else-if="viewMode === 'list'" class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Pelapor
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Jenis Satwa
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Kategori
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Lokasi
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Tanggal
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Prioritas
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="report in displayedReports"
              :key="report.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              :class="{ 'bg-red-50': isSuspicious(report) }"
              @click="handleViewDetail(report.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-primary-600">
                {{ report.idLaporan }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center gap-2">
                  {{ report.nama }}
                  <span
                    v-if="isSuspicious(report)"
                    class="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200"
                    :title="`Nomor ${report.telepon} telah mengirim ${SUSPICIOUS_THRESHOLD}+ laporan dalam ${SUSPICIOUS_WINDOW_DAYS} hari`"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    !
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ report.jenisSatwa }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ report.kategoriKonflik || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {{ report.lokasi || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(report.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="prioritasClass(report.prioritas)" class="px-2 py-1 text-xs rounded-full border">
                  {{ report.prioritas || 'Sedang' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UiBadge :status="report.status" size="sm" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click.stop="handleViewDetail(report.id)"
                  class="text-primary-600 hover:text-primary-800 font-medium"
                >
                  Detail
                </button>
                <button
                  @click.stop="openVerification(report)"
                  class="ml-3 text-secondary-600 hover:text-secondary-800 font-medium"
                >
                  Periksa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Popup Verifikasi Admin Riset -->
    <div
      v-if="selectedForVerification"
      class="fixed inset-0 z-[10000] flex items-start md:items-center justify-center overflow-y-auto bg-gray-900/60 p-4 pt-[calc(1rem_+_env(safe-area-inset-top))] pb-[calc(1rem_+_env(safe-area-inset-bottom))] backdrop-blur-sm transition-opacity"
      @click="clearVerification"
    >
      <div 
        class="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[calc(100dvh_-_2rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] overflow-y-auto flex flex-col md:flex-row transform transition-all"
        @click.stop
      >
        <!-- Info Column -->
        <div class="bg-gray-50 p-6 md:p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-2xl font-bold font-display text-gray-800">Verifikasi Laporan</h4>
          </div>
          
          <div class="space-y-4">
            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">ID Laporan</p>
              <p class="font-mono font-bold text-primary-700 text-lg">{{ selectedForVerification.idLaporan }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                 <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Jenis Satwa</p>
                 <p class="font-semibold text-gray-800">{{ selectedForVerification.jenisSatwa }}</p>
              </div>
              <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                 <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Kategori</p>
                 <p class="font-semibold text-gray-800">{{ selectedForVerification.kategoriKonflik || '-' }}</p>
              </div>
            </div>

            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status Saat Ini</p>
              <UiBadge :status="selectedForVerification.status" size="sm" />
            </div>
          </div>
        </div>

        <!-- Form Column -->
        <div class="p-6 md:p-8 md:w-1/2 bg-white relative">
          <button @click="clearVerification" class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h4 class="text-xl font-semibold text-gray-800 mb-5 pr-10 mt-1 md:mt-0">Tindakan Admin</h4>
          
          <form @submit.prevent="saveVerification('save')" class="space-y-6 flex flex-col h-full">
            <div class="space-y-4">
              <div>
                <label for="estimasi" class="block text-sm font-semibold text-gray-700 mb-2">Estimasi Kerugian (Rp)</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-semibold">Rp</span>
                  <input
                    id="estimasi"
                    type="number"
                    min="0"
                    v-model="verificationForm.estimasi_kerugian"
                    class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                    placeholder="Contoh: 5000000"
                  />
                </div>
              </div>
              
              <div>
                <label for="status-satwa" class="block text-sm font-semibold text-gray-700 mb-2">Status Satwa Akhir</label>
                <input
                  id="status-satwa"
                  type="text"
                  v-model="verificationForm.status_satwa_akhir"
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  placeholder="Misal: Dievakuasi ke pusat rehabilitasi"
                />
              </div>

              <div>
                <label for="catatan-admin" class="block text-sm font-semibold text-gray-700 mb-2">Catatan Admin</label>
                <textarea
                  id="catatan-admin"
                  rows="3"
                  v-model="verificationForm.catatan_admin"
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-none"
                  placeholder="Contoh: data sudah dikonfirmasi melalui telepon, atau alasan laporan tidak valid"
                ></textarea>
              </div>
            </div>

            <div class="mt-auto pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
      class="mt-8 flex flex-col sm:flex-row items-center justify-between"
    >
      <p class="text-sm text-gray-600 mb-4 sm:mb-0">
        Menampilkan
        {{ ((reportsStore.pagination.currentPage - 1) * reportsStore.pagination.itemsPerPage) + 1 }}
        -
        {{ Math.min(reportsStore.pagination.currentPage * reportsStore.pagination.itemsPerPage, visibleReports.length) }}
        dari {{ visibleReports.length }} laporan
      </p>

      <div class="flex items-center space-x-2">
        <!-- Previous Button -->
        <button
          @click="goToPage(reportsStore.pagination.currentPage - 1)"
          :disabled="reportsStore.pagination.currentPage === 1"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sebelumnya
        </button>

        <!-- Page Numbers -->
        <button
          v-for="page in paginationRange"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            page === reportsStore.pagination.currentPage
              ? 'bg-primary-500 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50',
          ]"
        >
          {{ page }}
        </button>

        <!-- Next Button -->
        <button
          @click="goToPage(reportsStore.pagination.currentPage + 1)"
          :disabled="reportsStore.pagination.currentPage === visibleTotalPages"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Berikutnya
        </button>
      </div>
    </div>
  </div>
</template>
