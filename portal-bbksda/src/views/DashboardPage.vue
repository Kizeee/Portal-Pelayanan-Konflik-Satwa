<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '../stores/reports'
import StatCard from '../components/charts/StatCard.vue'
import BarChart from '../components/charts/BarChart.vue'
import DoughnutChart from '../components/charts/DoughnutChart.vue'

const router = useRouter()
const reportsStore = useReportsStore()

/* =========================
   BULAN DINAMIS (YYYY-MM)
========================= */
const selectedMonth = ref(new Date().toISOString().slice(0, 7))

/* =========================
   FILTER LAPORAN PER BULAN
========================= */
const reportsByMonth = computed(() => {
  if (!selectedMonth.value) return reportsStore.reports

  const [year, month] = selectedMonth.value.split('-').map(Number)

  return reportsStore.reports.filter((report) => {
    if (!report.createdAt) return false

    const date = report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt)

    return date.getFullYear() === year && date.getMonth() + 1 === month
  })
})

/* =========================
   STATISTIK UTAMA
========================= */
const totalLaporan = computed(() => reportsByMonth.value.length)

const laporanPending = computed(
  () => reportsByMonth.value.filter((r) => r.status === 'Menunggu Verifikasi' || r.status === 'pending' || r.status === 'Diterima').length,
)

const laporanVerified = computed(
  () => reportsByMonth.value.filter((r) => r.status === 'Diterima' || r.status === 'verified').length,
)

const laporanSelesai = computed(() =>
  reportsByMonth.value.filter((r) => r.status === 'Selesai' || r.status === 'Penanganan di Lokasi' || r.status === 'Diproses').length,
)

/* =========================
   LAPORAN PER JENIS SATWA
========================= */
const laporanPerSatwa = computed(() => {
  const counts = reportsByMonth.value.reduce((acc, report) => {
    const key = report.jenisSatwa || 'Tidak Diketahui'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Jumlah Laporan',
        data: Object.values(counts),
        backgroundColor: [
          'rgba(56, 102, 65, 0.7)',
          'rgba(106, 153, 78, 0.7)',
          'rgba(167, 201, 87, 0.7)',
          'rgba(167, 123, 14, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  }
})

/* =========================
   LAPORAN PER STATUS
========================= */
const laporanPerStatus = computed(() => {
  const counts = reportsByMonth.value.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1
    return acc
  }, {})

  const labels = Object.keys(counts)
  const data = Object.values(counts)

  const colorMap = {
    Diterima: '#3B82F6', // biru
    'Menunggu Verifikasi': '#F59E0B',
    pending: '#F59E0B', // kuning
    'Penanganan di Lokasi': '#F59E0B',
    Diproses: '#F59E0B',
    Diterima: '#10B981',
    verified: '#10B981', // hijau
    Selesai: '#3B82F6', // biru
    Ditolak: '#EF4444',
    'Tidak Valid': '#EF4444', // merah
  }

  return {
    labels,
    datasets: [
      {
        label: 'Jumlah Laporan',
        data,
        backgroundColor: labels.map((label) => colorMap[label] || '#9CA3AF'),
      },
    ],
  }
})

/* =========================
   POLA WAKTU MINGGUAN
========================= */
const laporanPerMinggu = computed(() => {
  const minggu = [0, 0, 0, 0]

  reportsByMonth.value.forEach((report) => {
    const date = report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt)

    const day = date.getDate()

    if (day <= 7) minggu[0]++
    else if (day <= 14) minggu[1]++
    else if (day <= 21) minggu[2]++
    else minggu[3]++
  })

  return {
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
    datasets: [
      {
        label: 'Jumlah Laporan',
        data: minggu,
        backgroundColor: 'rgba(56, 102, 65, 0.7)',
        borderColor: 'rgb(56, 102, 65)',
        borderWidth: 1,
      },
    ],
  }
})

/* =========================
   STATISTIK LOKASI
========================= */
const laporanPerLokasi = computed(() => {
  const counts = reportsByMonth.value.reduce((acc, report) => {
    const lokasi = report.lokasi ? report.lokasi.trim().toLowerCase() : 'tidak diketahui'

    acc[lokasi] = (acc[lokasi] || 0) + 1
    return acc
  }, {})

  return {
    labels: Object.keys(counts).map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
    datasets: [
      {
        label: 'Jumlah Laporan',
        data: Object.values(counts),
        backgroundColor: 'rgba(106, 153, 78, 0.7)',
        borderColor: 'rgb(106, 153, 78)',
        borderWidth: 1,
      },
    ],
  }
})
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
      <h2 class="text-2xl sm:text-3xl font-bold text-brand-green">Statistik</h2>

      <div class="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
        <input
          type="month"
          v-model="selectedMonth"
          class="w-full xs:w-auto px-3 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light text-sm"
        />

        <button
          @click="router.push({ name: 'RekapBulanan' })"
          class="w-full xs:w-auto bg-brand-green text-white font-bold py-2 px-4 sm:px-5 rounded-lg hover:bg-brand-green-light transition-colors text-sm sm:text-base"
        >
          Buat Rekap Bulanan
        </button>
      </div>
    </div>

    <!-- STAT CARD -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <StatCard
        title="Total Laporan"
        :value="totalLaporan"
        gradient="stat-gradient-green"
        iconPath="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
      <StatCard
        title="Menunggu Verifikasi"
        :value="laporanPending"
        gradient="stat-gradient-yellow"
        iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <StatCard
        title="Terverifikasi"
        :value="laporanVerified"
        gradient="stat-gradient-teal"
        iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <StatCard
        title="Diproses / Selesai"
        :value="laporanSelesai"
        gradient="stat-gradient-blue"
        iconPath="M5 13l4 4L19 7"
      />
    </div>

    <!-- GRAFIK UTAMA -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md">
        <h3 class="font-semibold text-lg mb-4">Laporan per Jenis Satwa</h3>
        <BarChart :chart-data="laporanPerSatwa" />
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
        <h3 class="font-semibold text-lg mb-4">Proporsi Status Laporan</h3>
        <DoughnutChart :chart-data="laporanPerStatus" />
      </div>
    </div>

    <!-- POLA WAKTU -->
    <div class="bg-white p-6 rounded-2xl shadow-md mt-6">
      <h3 class="font-semibold text-lg mb-4">Pola Konflik Berdasarkan Minggu</h3>
      <BarChart :chart-data="laporanPerMinggu" />
    </div>

    <!-- STATISTIK LOKASI -->
    <div class="bg-white p-6 rounded-2xl shadow-md mt-6">
      <h3 class="font-semibold text-lg mb-4">Statistik Konflik Berdasarkan Lokasi</h3>
      <BarChart :chart-data="laporanPerLokasi" />
    </div>
  </div>
</template>
