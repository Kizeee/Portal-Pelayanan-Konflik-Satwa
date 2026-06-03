<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '../stores/reports'
import StatCard from '../components/charts/StatCard.vue'
import BarChart from '../components/charts/BarChart.vue'
import DoughnutChart from '../components/charts/DoughnutChart.vue'

const router = useRouter()
const reportsStore = useReportsStore()

const selectedMonth = ref(new Date().toISOString().slice(0, 7))

const STATUS_GROUPS = {
  pending: ['Menunggu Verifikasi', 'pending'],
  accepted: ['Diterima', 'verified'],
  process: ['Tim Menuju Lokasi', 'Penanganan di Lokasi', 'Diproses'],
  completed: ['Selesai'],
  rejected: ['Ditolak', 'Tidak Valid', 'ditolak'],
}

const hasStatus = (report, statuses) => statuses.includes(report.status)
const isPendingReport = (report) => hasStatus(report, STATUS_GROUPS.pending)
const isAcceptedReport = (report) => hasStatus(report, STATUS_GROUPS.accepted)
const isProcessReport = (report) => hasStatus(report, STATUS_GROUPS.process)
const isCompletedReport = (report) => hasStatus(report, STATUS_GROUPS.completed)
const isRejectedReport = (report) => hasStatus(report, STATUS_GROUPS.rejected)
const isValidReport = (report) => (
  isAcceptedReport(report) ||
  isProcessReport(report) ||
  isCompletedReport(report)
)

const reportsByMonth = computed(() => {
  if (!selectedMonth.value) return reportsStore.reports

  const [year, month] = selectedMonth.value.split('-').map(Number)

  return reportsStore.reports.filter((report) => {
    if (!report.createdAt) return false

    const date = report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt)

    return date.getFullYear() === year && date.getMonth() + 1 === month
  })
})

const validReportsByMonth = computed(() => reportsByMonth.value.filter(isValidReport))

const totalLaporan = computed(() => reportsByMonth.value.length)

const laporanPending = computed(() => reportsByMonth.value.filter(isPendingReport).length)

const laporanValid = computed(() => validReportsByMonth.value.length)

const laporanSelesai = computed(() => reportsByMonth.value.filter(isCompletedReport).length)

const laporanDitolak = computed(() => reportsByMonth.value.filter(isRejectedReport).length)

const laporanPerSatwa = computed(() => {
  const counts = validReportsByMonth.value.reduce((acc, report) => {
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

const laporanPerStatus = computed(() => {
  const reports = reportsByMonth.value

  return {
    labels: ['Menunggu Verifikasi', 'Diterima', 'Dalam Proses', 'Selesai', 'Ditolak/Tidak Valid'],
    datasets: [
      {
        label: 'Jumlah Laporan',
        data: [
          reports.filter(isPendingReport).length,
          reports.filter(isAcceptedReport).length,
          reports.filter(isProcessReport).length,
          reports.filter(isCompletedReport).length,
          reports.filter(isRejectedReport).length,
        ],
        backgroundColor: ['#F59E0B', '#3B82F6', '#6366F1', '#16A34A', '#DC2626'],
      },
    ],
  }
})

const laporanPerPrioritas = computed(() => {
  const counts = validReportsByMonth.value.reduce((acc, report) => {
    const prioritas = report.prioritas || 'Sedang'
    acc[prioritas] = (acc[prioritas] || 0) + 1
    return acc
  }, {})

  const labels = Object.keys(counts)
  const data = Object.values(counts)

  const colorMap = {
    Rendah: '#10B981', // green
    Sedang: '#F59E0B', // yellow
    Tinggi: '#EC4899', // pink
    Darurat: '#DC2626', // red
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

const laporanPerMinggu = computed(() => {
  const minggu = [0, 0, 0, 0]

  validReportsByMonth.value.forEach((report) => {
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


const laporanPerLokasi = computed(() => {
  const counts = validReportsByMonth.value.reduce((acc, report) => {
    let lokasi = 'Tidak Diketahui'
    if (report.kabupatenKota) {
      lokasi = report.kabupatenKota
    } else if (report.lokasi) {
      let loc = report.lokasi.trim().toLowerCase()
      if (loc === 'pku' || loc.includes('pekanbaru')) {
        lokasi = 'Kota Pekanbaru'
      } else {
        lokasi = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      }
    }

    acc[lokasi] = (acc[lokasi] || 0) + 1
    return acc
  }, {})

  return {
    labels: Object.keys(counts),
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


const dashboardInsights = computed(() => {
  const reports = reportsByMonth.value
  const validReports = validReportsByMonth.value
  
  if (reports.length === 0) {
    return []
  }

  const insights = []

  // 1. Wilayah terbanyak
  const lokasiCounts = {}
  validReports.forEach(r => {
    let lokasi = 'Tidak Diketahui'
    if (r.kabupatenKota) {
      lokasi = r.kabupatenKota
    } else if (r.lokasi) {
      let loc = r.lokasi.trim().toLowerCase()
      // Normalisasi sederhana untuk "pekanbaru" / "pku"
      if (loc === 'pku' || loc.includes('pekanbaru')) {
        lokasi = 'Kota Pekanbaru'
      } else {
        // Title case
        lokasi = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      }
    }
    
    if (lokasi !== 'Tidak Diketahui') {
      lokasiCounts[lokasi] = (lokasiCounts[lokasi] || 0) + 1
    }
  })
  
  let maxLokasi = null
  let maxLokasiCount = 0
  for (const [loc, count] of Object.entries(lokasiCounts)) {
    if (count > maxLokasiCount) {
      maxLokasi = loc
      maxLokasiCount = count
    }
  }

  if (maxLokasi) {
    insights.push(`Wilayah dengan laporan valid terbanyak pada periode ini adalah <strong>${maxLokasi}</strong> (${maxLokasiCount} laporan).`)
  }

  // 2. Jenis satwa terbanyak
  const satwaCounts = {}
  validReports.forEach(r => {
    const s = r.jenisSatwa || 'Tidak Diketahui'
    if (s !== 'Tidak Diketahui') {
      satwaCounts[s] = (satwaCounts[s] || 0) + 1
    }
  })

  let maxSatwa = null
  let maxSatwaCount = 0
  for (const [s, count] of Object.entries(satwaCounts)) {
    if (count > maxSatwaCount) {
      maxSatwa = s
      maxSatwaCount = count
    }
  }

  if (maxSatwa) {
    insights.push(`Jenis satwa yang paling sering muncul pada laporan valid adalah <strong>${maxSatwa}</strong> (${maxSatwaCount} kejadian).`)
  }

  // 3. Status dominan
  const statusCounts = {}
  reports.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1
  })

  let maxStatus = null
  let maxStatusCount = 0
  for (const [st, count] of Object.entries(statusCounts)) {
    if (count > maxStatusCount) {
      maxStatus = st
      maxStatusCount = count
    }
  }

  if (maxStatus) {
    insights.push(`Sebagian besar laporan pada periode ini berstatus <strong>${maxStatus}</strong> (${Math.round((maxStatusCount / reports.length) * 100)}%).`)
  }

  // 4. Laporan prioritas tinggi/darurat
  const prioritasDarurat = reports.filter(r => 
    (r.prioritas === 'Tinggi' || r.prioritas === 'Darurat') && 
    !isCompletedReport(r) &&
    !isRejectedReport(r)
  ).length

  if (prioritasDarurat > 0) {
    insights.push(`<span class="text-red-600">Terdapat <strong>${prioritasDarurat}</strong> laporan prioritas Tinggi/Darurat yang belum selesai dan perlu ditindaklanjuti.</span>`)
  }

  return insights
})

const statsPenanganan = computed(() => {
  const completedReports = reportsByMonth.value.filter(isCompletedReport)
  
  let totalMs = 0
  let minMs = Infinity
  let maxMs = 0
  let countCompleted = 0

  completedReports.forEach(r => {
    const started = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt)
    if (isNaN(started)) return

    let completedDate = null
    
    // Check statusHistory first
    if (r.statusHistory && Array.isArray(r.statusHistory)) {
      const historyItems = [...r.statusHistory].reverse()
      const finishEvent = historyItems.find(h => h.status === 'Selesai')
      if (finishEvent && finishEvent.timestamp) {
        completedDate = finishEvent.timestamp.toDate ? finishEvent.timestamp.toDate() : new Date(finishEvent.timestamp)
      }
    }
    
    // Fallback if not found in history
    if (!completedDate && r.updatedAt) {
       completedDate = r.updatedAt.toDate ? r.updatedAt.toDate() : new Date(r.updatedAt)
    }

    if (completedDate && !isNaN(completedDate)) {
      const diffMs = completedDate.getTime() - started.getTime()
      if (diffMs > 0) {
        totalMs += diffMs
        if (diffMs < minMs) minMs = diffMs
        if (diffMs > maxMs) maxMs = diffMs
        countCompleted++
      }
    }
  })

  const formatTime = (ms) => {
    if (!isFinite(ms)) return '-'
    
    const totalMinutes = Math.floor(ms / (1000 * 60))
    const days = Math.floor(totalMinutes / (24 * 60))
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
    const minutes = totalMinutes % 60

    if (days === 0 && hours === 0 && minutes === 0) return '< 1 menit'
    if (days === 0 && hours === 0) return `${minutes} mnt`
    if (days === 0) return `${hours} jam ${minutes > 0 ? minutes + ' mnt' : ''}`.trim()
    return `${days} hari ${hours > 0 ? hours + ' jam' : ''}`.trim()
  }

  const avgMs = countCompleted > 0 ? totalMs / countCompleted : 0

  // Belum selesai lebih dari 3 hari
  const now = new Date().getTime()
  const unresolvedOver3Days = reportsByMonth.value.filter(r => {
    if (isCompletedReport(r) || isRejectedReport(r)) return false
    const started = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt)
    if (isNaN(started)) return false
    const diffDays = (now - started.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays > 3
  }).length

  return {
    hasData: countCompleted > 0,
    avg: formatTime(avgMs),
    min: formatTime(minMs),
    max: formatTime(maxMs),
    unresolved3Days: unresolvedOver3Days
  }
})
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-stone-800">Statistik</h2>
        <p class="text-stone-500 text-sm mt-0.5">Ringkasan data laporan konflik satwa</p>
      </div>

      <div class="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
        <input
          type="month"
          v-model="selectedMonth"
          class="month-input-ios w-full xs:w-auto px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-forest-300 focus:border-forest-500 outline-none text-sm bg-white"
        />

        <button
          @click="router.push({ name: 'RekapBulanan' })"
          class="w-full xs:w-auto bg-forest-600 text-white font-semibold py-2 px-4 sm:px-5 rounded-lg hover:bg-forest-700 transition-colors text-sm"
        >
          Buat Rekap Bulanan
        </button>
      </div>
    </div>

    <!-- STAT CARD -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
      <StatCard
        title="Total Masuk"
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
        title="Laporan Valid"
        :value="laporanValid"
        gradient="stat-gradient-teal"
        iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <StatCard
        title="Selesai"
        :value="laporanSelesai"
        gradient="stat-gradient-blue"
        iconPath="M5 13l4 4L19 7"
      />
      <StatCard
        title="Ditolak/Tidak Valid"
        :value="laporanDitolak"
        gradient="stat-gradient-red"
        iconPath="M6 18L18 6M6 6l12 12"
      />
    </div>

    <!-- INSIGHT OTOMATIS -->
    <div class="bg-white border border-stone-200 p-5 sm:p-6 rounded-lg shadow-sm mb-8">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-forest-50 text-forest-700 p-2 rounded-md border border-forest-200">
          <!-- Bar chart icon — practical, not AI -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="12" width="4" height="9"/>
            <rect x="10" y="7" width="4" height="14"/>
            <rect x="17" y="3" width="4" height="18"/>
          </svg>
        </div>
        <h3 class="font-bold text-base text-stone-800">Ringkasan Analisis</h3>
      </div>
      
      <div v-if="dashboardInsights.length === 0" class="text-stone-400 italic text-sm">
        Belum cukup data untuk menampilkan insight pada periode ini.
      </div>
      <ul v-else class="space-y-2.5">
        <li v-for="(insight, index) in dashboardInsights" :key="index" class="flex items-start gap-2 text-stone-700 text-sm">
          <svg class="h-4 w-4 text-forest-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span v-html="insight" class="leading-relaxed"></span>
        </li>
      </ul>
    </div>

    <!-- GRAFIK UTAMA -->
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <div class="lg:col-span-4 bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
        <h3 class="font-semibold text-base text-stone-700 mb-4">Laporan Valid per Jenis Satwa</h3>
        <BarChart :chart-data="laporanPerSatwa" />
      </div>

      <div class="lg:col-span-2 flex flex-col gap-6">
        <div class="bg-white p-6 rounded-lg border border-stone-200 shadow-sm flex-1">
          <h3 class="font-semibold text-base text-stone-700 mb-4">Proporsi Status Laporan</h3>
          <DoughnutChart :chart-data="laporanPerStatus" />
        </div>
        <div class="bg-white p-6 rounded-lg border border-stone-200 shadow-sm flex-1">
          <h3 class="font-semibold text-base text-stone-700 mb-4">Proporsi Prioritas Laporan</h3>
          <DoughnutChart :chart-data="laporanPerPrioritas" />
        </div>
      </div>
    </div>

    <!-- POLA WAKTU -->
    <div class="bg-white p-6 rounded-lg border border-stone-200 shadow-sm mt-6">
      <h3 class="font-semibold text-base text-stone-700 mb-4">Pola Laporan Valid Berdasarkan Minggu</h3>
      <BarChart :chart-data="laporanPerMinggu" />
    </div>

    <!-- STATISTIK WAKTU PENANGANAN -->
    <div class="bg-white p-6 rounded-lg border border-stone-200 shadow-sm mt-6">
      <h3 class="font-semibold text-base text-stone-700 mb-4 flex items-center gap-2">
        <!-- Clock icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Kecepatan Penanganan Laporan
      </h3>
      
      <div v-if="!statsPenanganan.hasData" class="text-stone-400 italic text-sm">
        Belum cukup data untuk menghitung rata-rata waktu penanganan pada periode ini.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-sky-50 border border-sky-100 p-4 rounded-lg">
          <p class="text-xs text-sky-700 font-semibold uppercase tracking-wider mb-1">Rata-rata Penyelesaian</p>
          <p class="text-xl font-bold text-sky-900">{{ statsPenanganan.avg }}</p>
        </div>
        <div class="bg-forest-50 border border-forest-100 p-4 rounded-lg">
          <p class="text-xs text-forest-700 font-semibold uppercase tracking-wider mb-1">Tercepat Selesai</p>
          <p class="text-xl font-bold text-forest-900">{{ statsPenanganan.min }}</p>
        </div>
        <div class="bg-amber-50 border border-amber-100 p-4 rounded-lg">
          <p class="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1">Paling Lama Selesai</p>
          <p class="text-xl font-bold text-amber-900">{{ statsPenanganan.max }}</p>
        </div>
        <div class="bg-rose-50 border border-rose-100 p-4 rounded-lg">
          <p class="text-xs text-rose-700 font-semibold uppercase tracking-wider mb-1">Belum Selesai &gt; 3 Hari</p>
          <p class="text-xl font-bold text-rose-900">{{ statsPenanganan.unresolved3Days }} Laporan</p>
        </div>
      </div>
    </div>

    <!-- STATISTIK LOKASI -->
    <div class="bg-white p-6 rounded-lg border border-stone-200 shadow-sm mt-6">
      <h3 class="font-semibold text-base text-stone-700 mb-4">Laporan Valid Berdasarkan Lokasi</h3>
      <BarChart :chart-data="laporanPerLokasi" />
    </div>
  </div>
</template>
