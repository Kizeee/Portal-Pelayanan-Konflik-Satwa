<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '../stores/reports'
import { useUIStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'
import { useReports } from '../composables/useReports'
import { arrayUnion } from 'firebase/firestore'
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

// Status options
const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'Menunggu Verifikasi', label: 'Menunggu Verifikasi', color: 'warning' },
  { value: 'Diterima', label: 'Diterima', color: 'info' },
  { value: 'Tim Menuju Lokasi', label: 'Tim Menuju Lokasi', color: 'info' },
  { value: 'Penanganan di Lokasi', label: 'Penanganan di Lokasi', color: 'info' },
  { value: 'Selesai', label: 'Selesai', color: 'success' },
  { value: 'Ditolak', label: 'Ditolak', color: 'error' },
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
  reportsStore.setPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const paginationRange = computed(() => {
  const total = reportsStore.totalPages
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
  const s = selectedForVerification.value.status
  return s === 'Menunggu Verifikasi' || s === 'pending' || s === 'Diterima'
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

// ===== Verifikasi laporan riset =====
const selectedForVerification = ref(null)
const verificationForm = ref({
  estimasi_kerugian: '',
  status_satwa_akhir: '',
})
const isSavingVerification = ref(false)

const openVerification = (report) => {
  selectedForVerification.value = report
  verificationForm.value = {
    estimasi_kerugian: report.estimasi_kerugian ?? '',
    status_satwa_akhir: report.status_satwa_akhir || '',
  }
}

const clearVerification = () => {
  selectedForVerification.value = null
  verificationForm.value = {
    estimasi_kerugian: '',
    status_satwa_akhir: '',
  }
}

const saveVerification = async (markVerified = false) => {
  if (!selectedForVerification.value) return

  isSavingVerification.value = true
  const payload = {
    estimasi_kerugian:
      verificationForm.value.estimasi_kerugian !== '' && !Number.isNaN(Number(verificationForm.value.estimasi_kerugian))
        ? Number(verificationForm.value.estimasi_kerugian)
        : null,
    status_satwa_akhir: verificationForm.value.status_satwa_akhir?.trim() || '',
  }

  if (markVerified) {
    payload.status = 'Diterima'
    // Tambahkan entri statusHistory agar watcher warga menerima catatan
    payload.statusHistory = arrayUnion({
      status: 'Diterima',
      timestamp: new Date(),
      updatedBy: authStore.user?.email || 'Admin',
      notes: verificationForm.value.status_satwa_akhir?.trim()
        ? `Status satwa: ${verificationForm.value.status_satwa_akhir.trim()}`
        : 'Laporan telah diverifikasi dan diterima oleh admin.',
    })
  }

  try {
    await updateReport(selectedForVerification.value.id, payload)
    await reportsStore.loadReports()

    // refresh selected data dari store terkini
    selectedForVerification.value = reportsStore.reports.find((r) => r.id === selectedForVerification.value.id)
    uiStore.showNotification(
      'success',
      markVerified ? 'Laporan terverifikasi' : 'Perubahan disimpan',
      markVerified ? 'Status laporan berubah menjadi Diterima.' : 'Data tambahan tersimpan.'
    )
  } catch (error) {
    console.error('Gagal menyimpan verifikasi:', error)
    uiStore.showNotification('error', 'Gagal', 'Tidak dapat menyimpan perubahan verifikasi.')
  } finally {
    isSavingVerification.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gradient-primary mb-1 sm:mb-2">Kelola Laporan</h2>
        <p class="text-gray-600 text-sm sm:text-base">
          Menampilkan
          <span class="font-semibold text-primary-600">{{ reportsStore.filteredReports.length }}</span>
          dari {{ reportsStore.reports.length }} laporan
        </p>
      </div>

      <!-- View Mode Toggle (Desktop) -->
      <div class="hidden sm:flex items-center space-x-2">
        <button
          @click="viewMode = 'grid'"
          :class="viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          class="px-4 py-2 rounded-lg transition-colors"
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
          class="px-4 py-2 rounded-lg transition-colors"
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

    <!-- Filter Panel -->
    <UiCard class="mb-6" padding="p-5">
      <!-- Search Bar -->
      <UiSearchBar
        v-model="reportsStore.filters.search"
        placeholder="Cari berdasarkan ID, nama, lokasi, jenis satwa..."
        :result-count="reportsStore.filteredReports.length"
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

        <!-- Reset Filters -->
        <button
          v-if="reportsStore.hasActiveFilters"
          @click="reportsStore.clearFilters()"
          class="filter-reset-btn"
        >
          ✕ Reset Filter
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
      v-else-if="reportsStore.filteredReports.length === 0"
      class="text-center py-20 bg-gray-50 rounded-xl"
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
      <p class="text-gray-500 mb-4">Coba sesuaikan filter pencarian Anda</p>
      <UiButton @click="reportsStore.clearFilters()" variant="primary">
        Hapus Semua Filter
      </UiButton>
    </div>

    <!-- Grid View -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <UiCard
        v-for="report in reportsStore.paginatedReports"
        :key="report.id"
        hoverable
        clickable
        @click="handleViewDetail(report.id)"
        class="animate-slide-up"
      >
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-xl font-bold text-primary-700 font-mono">{{ report.idLaporan }}</h3>
          <div class="flex items-center gap-2">
            <UiBadge :status="report.status" size="md" dot />
            <UiButton variant="outline" size="xs" @click.stop="openVerification(report)">
              Verifikasi
            </UiButton>
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex items-center text-gray-600">
            <span class="text-2xl mr-2"></span>
            <strong class="font-semibold text-gray-800">{{ report.jenisSatwa }}</strong>
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

        <div class="mt-4 pt-4 border-t border-gray-200">
          <UiButton variant="primary" size="sm" block>
            Lihat Detail →
          </UiButton>
        </div>
      </UiCard>
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="bg-white rounded-xl shadow-card overflow-hidden">
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
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="report in reportsStore.paginatedReports"
              :key="report.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="handleViewDetail(report.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-primary-600">
                {{ report.idLaporan }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ report.nama }}
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
                  Verifikasi
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
      class="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity"
      @click="clearVerification"
    >
      <div 
        class="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row transform transition-all"
        @click.stop
      >
        <!-- Info Column -->
        <div class="bg-gray-50 p-6 md:p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-2xl font-bold font-display text-gray-800">Verifikasi Laporan</h4>
          </div>
          
          <div class="space-y-4">
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">ID Laporan</p>
              <p class="font-mono font-bold text-primary-700 text-lg">{{ selectedForVerification.idLaporan }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                 <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Jenis Satwa</p>
                 <p class="font-semibold text-gray-800">{{ selectedForVerification.jenisSatwa }}</p>
              </div>
              <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                 <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Kategori</p>
                 <p class="font-semibold text-gray-800">{{ selectedForVerification.kategoriKonflik || '-' }}</p>
              </div>
            </div>

            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
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
          
          <h4 class="text-xl font-semibold text-gray-800 mb-6 mt-2 md:mt-0">Tindakan Admin</h4>
          
          <form @submit.prevent="saveVerification(false)" class="space-y-6 flex flex-col h-full">
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
                    class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
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
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  placeholder="Misal: Dievakuasi ke pusat rehabilitasi"
                />
              </div>
            </div>

            <div class="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
              <UiButton
                type="button"
                variant="primary"
                :disabled="!canVerify || isSavingVerification"
                @click="saveVerification(true)"
                class="flex-1 justify-center py-3"
              >
                {{ isSavingVerification ? 'Memproses...' : 'Terima / Verifikasi' }}
              </UiButton>
              <UiButton 
                type="submit" 
                variant="outline" 
                :loading="isSavingVerification"
                class="flex-1 justify-center py-3"
              >
                Simpan Catatan
              </UiButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="reportsStore.totalPages > 1"
      class="mt-8 flex flex-col sm:flex-row items-center justify-between"
    >
      <p class="text-sm text-gray-600 mb-4 sm:mb-0">
        Menampilkan
        {{ ((reportsStore.pagination.currentPage - 1) * reportsStore.pagination.itemsPerPage) + 1 }}
        -
        {{ Math.min(reportsStore.pagination.currentPage * reportsStore.pagination.itemsPerPage, reportsStore.filteredReports.length) }}
        dari {{ reportsStore.filteredReports.length }} laporan
      </p>

      <div class="flex items-center space-x-2">
        <!-- Previous Button -->
        <button
          @click="goToPage(reportsStore.pagination.currentPage - 1)"
          :disabled="reportsStore.pagination.currentPage === 1"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ←
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
          :disabled="reportsStore.pagination.currentPage === reportsStore.totalPages"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>
