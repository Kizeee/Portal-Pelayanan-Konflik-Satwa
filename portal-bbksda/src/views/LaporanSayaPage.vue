<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReportsStore } from '../stores/reports'
import { useAuthStore } from '../stores/auth'
import { useReporterNotificationsStore } from '../stores/reporterNotifications'
import { useUIStore } from '../stores/ui'
import { normalizeTicketId } from '../utils/ticketId'

const route = useRoute()
const router = useRouter()
const reportsStore = useReportsStore()
const authStore = useAuthStore()
const reporterNotifStore = useReporterNotificationsStore()
const uiStore = useUIStore()

const ticketId = ref('')
const foundReportId = ref('')
const isSearching = ref(false)
const hasSearched = ref(false)
const errorMessage = ref('')

const foundReport = computed(() => {
  if (!foundReportId.value) return null
  return reportsStore.reports.find((report) => report.id === foundReportId.value) || null
})

const formatDate = (value) => {
  if (!value) return '-'
  const date = value.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const getStatusStep = (status) => {
  if (['Ditolak', 'Tidak Valid', 'ditolak'].includes(status)) return -1
  if (status === 'Selesai') return 4
  if (['Tim Menuju Lokasi', 'Penanganan di Lokasi', 'Diproses'].includes(status)) return 3
  if (['Diterima', 'verified'].includes(status)) return 2
  return 1
}

const statusLabel = computed(() => {
  const status = foundReport.value?.status
  if (!status) return '-'
  if (['Menunggu Verifikasi', 'pending'].includes(status)) return 'Dikirim'
  if (['Diterima', 'verified'].includes(status)) return 'Diverifikasi'
  if (['Tim Menuju Lokasi', 'Penanganan di Lokasi', 'Diproses'].includes(status)) return 'Penanganan'
  return status
})

const statusClass = computed(() => {
  const status = foundReport.value?.status
  if (['Ditolak', 'Tidak Valid', 'ditolak'].includes(status)) return 'bg-red-50 text-red-700 border-red-200'
  if (status === 'Selesai') return 'bg-green-50 text-green-700 border-green-200'
  if (['Tim Menuju Lokasi', 'Penanganan di Lokasi', 'Diproses'].includes(status)) {
    return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  }
  if (['Diterima', 'verified'].includes(status)) return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
})

const handleSearch = async (updateRoute = true) => {
  const normalized = normalizeTicketId(ticketId.value)
  foundReportId.value = ''
  errorMessage.value = ''
  hasSearched.value = true

  if (!normalized) {
    errorMessage.value = 'Masukkan ID Tiket laporan terlebih dahulu.'
    return
  }

  ticketId.value = normalized
  isSearching.value = true

  try {
    const report = await reportsStore.findReportByTicketId(normalized)

    if (!report) {
      errorMessage.value = 'ID Tiket tidak ditemukan. Periksa kembali penulisan ID Anda.'
      return
    }

    foundReportId.value = report.id
    reportsStore.setSelectedReport(report.id)
    if (!reportsStore.myReportIds.includes(report.id)) {
      reportsStore.myReportIds.push(report.id)
    }
    reporterNotifStore.watchReport(report.id)

    if (updateRoute) {
      router.replace({ name: 'LaporanSaya', query: { id: normalized } })
    }
  } catch (error) {
    console.error('Gagal mencari laporan:', error)
    errorMessage.value = 'Gagal mengambil status laporan. Silakan coba lagi beberapa saat.'
  } finally {
    isSearching.value = false
  }
}

const canEditReport = computed(() => {
  return Boolean(!authStore.user && foundReport.value && !foundReport.value.reporterEditUsed)
})

const handleEditReport = () => {
  if (!canEditReport.value) return
  uiStore.openEditModal(foundReport.value)
}

const handleViewDetail = () => {
  if (!foundReport.value?.id) return
  reportsStore.setSelectedReport(foundReport.value.id)
  router.push({ name: 'Detail', params: { id: foundReport.value.id } })
}

onMounted(() => {
  const queryTicketId = normalizeTicketId(route.query.id)
  if (queryTicketId) {
    ticketId.value = queryTicketId
    handleSearch(false)
  }
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-2">
    <div class="mb-6">
      <h2 class="text-2xl sm:text-3xl font-bold text-stone-800">Laporan Saya</h2>
      <p class="text-stone-500 text-sm mt-1">
        Masukkan ID Tiket yang Anda terima setelah submit laporan untuk melihat status terbaru dari database.
      </p>
    </div>

    <div class="bg-white border border-stone-200 rounded-xl shadow-sm p-5 sm:p-6">
      <form class="flex flex-col sm:flex-row gap-3 sm:items-end" @submit.prevent="handleSearch()">
        <div class="flex-1">
          <label for="ticket-id" class="block text-sm font-semibold text-stone-700 mb-1.5">ID Tiket Laporan</label>
          <input
            id="ticket-id"
            v-model="ticketId"
            type="text"
            class="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-forest-300 focus:border-forest-500 outline-none font-mono text-sm uppercase bg-white"
            placeholder="BKSDA-202606-0001"
          />
        </div>
        <button
          type="submit"
          :disabled="isSearching"
          class="bg-forest-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          {{ isSearching ? 'Mencari...' : 'Cari Status' }}
        </button>
      </form>
      <p class="text-xs text-stone-400 mt-2.5">
        ID Tiket bersifat unik. Simpan ID tersebut agar Anda dapat memantau perkembangan laporan dari perangkat mana pun.
      </p>
    </div>

    <div v-if="errorMessage" class="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm font-medium">
      {{ errorMessage }}
    </div>

    <div
      v-else-if="hasSearched && !foundReport && !isSearching"
      class="mt-5 bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center"
    >
      <h3 class="font-bold text-gray-800 mb-1">Belum ada laporan yang ditampilkan.</h3>
      <p class="text-sm text-gray-500">Masukkan ID Tiket lalu tekan Cari Status.</p>
    </div>

    <div v-if="foundReport" class="mt-5 bg-white border border-stone-200 rounded-xl shadow-sm p-5 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider">ID Tiket</p>
          <h3 class="text-xl sm:text-2xl font-mono font-bold text-forest-700 mt-1">
            {{ foundReport.idLaporan || foundReport.id }}
          </h3>
        </div>
        <span :class="statusClass" class="inline-flex items-center justify-center px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide self-start">
          {{ statusLabel }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-stone-600 py-4">
        <p><strong class="text-stone-700">Jenis Satwa:</strong> {{ foundReport.jenisSatwa || '-' }}</p>
        <p><strong class="text-stone-700">Tanggal Kejadian:</strong> {{ formatDate(foundReport.tanggal) }}</p>
        <p class="sm:col-span-2"><strong class="text-stone-700">Lokasi:</strong> {{ foundReport.lokasi || '-' }}</p>
      </div>

      <div v-if="getStatusStep(foundReport.status) === -1" class="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-lg text-center">
        Laporan ini ditolak atau tidak valid dan tidak dapat ditindaklanjuti lebih lanjut.
      </div>
      <div v-else class="px-1 py-3">
        <div class="relative flex items-start justify-between">
          <div class="absolute left-0 right-0 top-3 h-1 bg-stone-200 rounded-full">
            <div
              class="h-full bg-forest-500 rounded-full transition-all duration-500"
              :style="{ width: `${((getStatusStep(foundReport.status) - 1) / 3) * 100}%` }"
            ></div>
          </div>

          <div
            v-for="(step, index) in ['Dikirim', 'Diverifikasi', 'Penanganan', 'Selesai']"
            :key="step"
            class="relative z-10 flex flex-col items-center text-center w-20"
          >
            <div
              class="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold ring-4 ring-white shadow-sm transition-colors"
              :class="getStatusStep(foundReport.status) >= index + 1 ? 'bg-forest-600 text-white' : 'bg-stone-200 text-stone-400'"
            >
              {{ index + 1 }}
            </div>
            <span class="text-[10px] sm:text-xs font-semibold text-stone-500 mt-2 bg-white px-1">{{ step }}</span>
          </div>
        </div>
      </div>

      <div v-if="!authStore.user" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p v-if="canEditReport" class="font-medium">
          Anda memiliki 1 kali kesempatan untuk memperbaiki data laporan jika ada salah ketik atau kekeliruan pengisian.
        </p>
        <p v-else class="font-medium">
          Kesempatan memperbaiki laporan sudah digunakan.
        </p>
      </div>

      <div class="mt-5 flex flex-col sm:flex-row gap-3">
        <button
          v-if="canEditReport"
          @click="handleEditReport"
          class="flex-1 bg-amber-500 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-amber-600 transition-colors text-sm"
        >
          Perbaiki Laporan
        </button>
        <button
          @click="handleViewDetail"
          class="flex-1 bg-forest-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-forest-700 transition-colors text-sm"
        >
          Lihat Detail Laporan
        </button>
        <button
          @click="router.push({ name: 'Lapor' })"
          class="flex-1 bg-stone-100 text-stone-700 font-semibold py-2.5 px-5 rounded-lg hover:bg-stone-200 transition-colors text-sm"
        >
          Buat Laporan Baru
        </button>
      </div>
    </div>

    <div class="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
      <strong>Keadaan darurat?</strong>
      Jika satwa masih mengancam keselamatan, jangan menunggu status portal. Segera hubungi WhatsApp 0813-7474-2981.
    </div>
  </div>
</template>
