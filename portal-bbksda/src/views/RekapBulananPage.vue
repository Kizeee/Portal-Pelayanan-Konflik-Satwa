<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'vue-router'; // 1. Impor useRouter
import StatCard from '../components/charts/StatCard.vue';
import BarChart from '../components/charts/BarChart.vue';

// --- STATE MANAGEMENT ---
const allReports = ref([]);
const isLoading = ref(true);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const router = useRouter(); // 2. Inisialisasi router

// --- DATA FETCHING ---
onMounted(async () => {
  try {
    const q = query(collection(db, 'laporan'));
    const querySnapshot = await getDocs(q);
    allReports.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
    }));
  } catch (error) {
    console.error("Error fetching reports: ", error);
  } finally {
    isLoading.value = false;
  }
});

// --- COMPUTED PROPERTIES ---
const filteredReports = computed(() => {
  if (!selectedMonth.value || allReports.value.length === 0) {
    return [];
  }
  const [year, month] = selectedMonth.value.split('-').map(Number);
  
  return allReports.value.filter(report => {
    const reportDate = new Date(report.createdAt);
    return reportDate.getFullYear() === year && (reportDate.getMonth() + 1) === month;
  });
});

const reportStats = computed(() => {
  const reports = filteredReports.value;
  const total = reports.length;
  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {});
  
  const satwaCounts = reports.reduce((acc, report) => {
    acc[report.jenisSatwa] = (acc[report.jenisSatwa] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    diterima: statusCounts['Diterima'] || 0,
    diproses: statusCounts['Diproses'] || 0,
    selesai: statusCounts['Selesai'] || 0,
    tidakValid: statusCounts['Tidak Valid'] || 0,
    satwa: satwaCounts,
  };
});

const satwaChartData = computed(() => {
  const satwaData = reportStats.value.satwa;
  return {
    labels: Object.keys(satwaData),
    datasets: [
      {
        label: 'Jumlah Laporan per Jenis Satwa',
        backgroundColor: '#4A90E2',
        data: Object.values(satwaData),
      },
    ],
  };
});

// --- METHODS ---
const printReport = () => {
  window.print();
};

// 3. Buat fungsi untuk kembali
const goBack = () => {
  router.back();
};

const formatMonth = (month) => {
    if (!month) return '';
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};
</script>

<template>
  <div class="container mx-auto p-4 sm:p-6">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 print:hidden">
      <div class="flex items-center gap-4">
        <h1 class="text-3xl font-bold text-brand-green">Rekap Laporan Bulanan</h1>
      </div>
      <div class="flex items-center gap-4 mt-4 md:mt-0">
        <input 
          type="month" 
          v-model="selectedMonth"
          class="px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light"
        />
        <button @click="printReport" class="bg-brand-green text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg transition-shadow">
          Cetak
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500">Memuat data...</p>
    </div>

    <div v-else id="printable-area">
      <div class="text-center mb-8 hidden print:block">
        <h2 class="text-2xl font-bold">Laporan Bulanan Konflik Satwa</h2>
        <h3 class="text-xl">{{ formatMonth(selectedMonth) }}</h3>
      </div>
      
      <div v-if="filteredReports.length > 0">
        <!-- Statistik Utama -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Laporan" :value="reportStats.total" />
          <StatCard title="Diterima" :value="reportStats.diterima" color="blue" />
          <StatCard title="Diproses" :value="reportStats.diproses" color="yellow" />
          <StatCard title="Selesai" :value="reportStats.selesai" color="green" />
        </div>

        <!-- Grafik dan Tabel -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-xl font-semibold mb-4">Laporan per Jenis Satwa</h3>
            <BarChart :chart-data="satwaChartData" />
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-xl font-semibold mb-4">Daftar Laporan</h3>
            <div class="overflow-y-auto h-96">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Satwa</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="report in filteredReports" :key="report.id">
                    <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ report.idLaporan }}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ report.jenisSatwa }}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ report.status }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-10 bg-gray-50 rounded-lg">
        <p class="text-gray-600 font-semibold">Tidak ada data laporan untuk bulan yang dipilih.</p>
        <p class="text-sm text-gray-500">Silakan pilih bulan dan tahun yang lain.</p>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #printable-area, #printable-area * {
    visibility: visible;
  }
  #printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
