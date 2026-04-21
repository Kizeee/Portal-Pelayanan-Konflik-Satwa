<script setup>
import { useRouter } from 'vue-router'
import { useReportsStore } from '../stores/reports'
import { useUIStore } from '../stores/ui'

const router = useRouter()
const reportsStore = useReportsStore()
const uiStore = useUIStore()

const handleViewDetail = (reportId) => {
  reportsStore.setSelectedReport(reportId)
  router.push({ name: 'Detail', params: { id: reportId } })
}

const handleEditReport = async (reportId) => {
  const report = reportsStore.reports.find(r => r.id === reportId)
  if (report) {
    uiStore.openEditModal(report)
  } else {
    uiStore.showNotification('error', 'Gagal', 'Laporan tidak ditemukan.')
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      <h2 class="text-2xl sm:text-3xl font-bold text-brand-green">Laporan Saya</h2>
      <button
        @click="router.push({ name: 'Lapor' })"
        class="w-full sm:w-auto bg-brand-green text-white px-6 py-2.5 rounded-lg hover:bg-brand-green-light transition-colors text-sm sm:text-base"
      >
        + Buat Laporan Baru
      </button>
    </div>

    <div v-if="reportsStore.myReports.length === 0" class="text-center p-10 bg-white rounded-xl">
      <p class="text-gray-500 mb-4">Anda belum memiliki laporan.</p>
      <button
        @click="router.push({ name: 'Lapor' })"
        class="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green-light transition-colors"
      >
        Buat Laporan Pertama
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="report in reportsStore.myReports"
        :key="report.id"
        class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="font-semibold text-lg text-gray-800">{{ report.idLaporan }}</h3>
          <span
            :class="{
              'bg-amber-100 text-amber-800': report.status === 'Menunggu Verifikasi' || report.status === 'pending',
              'bg-blue-100 text-blue-800': report.status === 'Diterima' || report.status === 'verified',
              'bg-emerald-100 text-emerald-800': report.status === 'Tim Menuju Lokasi',
              'bg-yellow-100 text-yellow-800': report.status === 'Penanganan di Lokasi' || report.status === 'Diproses',
              'bg-green-100 text-green-800': report.status === 'Selesai',
              'bg-red-100 text-red-800': report.status === 'Ditolak' || report.status === 'Tidak Valid',
            }"
            class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
          >
            {{ report.status }}
          </span>
        </div>

        <div class="space-y-2 text-sm text-gray-600 mb-4">
          <p>
            <span class="font-semibold">Jenis Satwa:</span> {{ report.jenisSatwa }}
          </p>
          <p>
            <span class="font-semibold">Kategori Konflik:</span> {{ report.kategoriKonflik || '-' }}
          </p>
          <p>
            <span class="font-semibold">Lokasi:</span> {{ report.lokasi || 'Tidak ada' }}
          </p>
          <p>
            <span class="font-semibold">Tanggal:</span>
            {{ new Date(report.tanggal).toLocaleDateString('id-ID') }}
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="handleViewDetail(report.id)"
            class="flex-1 bg-brand-green text-white py-2 rounded-lg hover:bg-brand-green-light transition-colors"
          >
            Lihat Detail
          </button>
          <button
            v-if="report.status === 'Menunggu Verifikasi' || report.status === 'pending'"
            @click="handleEditReport(report.id)"
            class="px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
