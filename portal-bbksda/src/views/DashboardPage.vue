<script setup>
import { computed } from 'vue';
import StatCard from '../components/charts/StatCard.vue';
import BarChart from '../components/charts/BarChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';

const props = defineProps({
  reports: Array,
});

// --- PERBAIKAN: Tambahkan emit untuk navigasi ---
const emit = defineEmits(['navigate']);

// Sisa dari <script setup> Anda sudah sempurna dan tidak perlu diubah.
const totalLaporan = computed(() => props.reports.length);
const laporanDiproses = computed(() => props.reports.filter(r => r.status === 'Diproses').length);
const laporanSelesai = computed(() => props.reports.filter(r => r.status === 'Selesai').length);

const laporanPerSatwa = computed(() => {
  const counts = props.reports.reduce((acc, report) => {
    acc[report.jenisSatwa] = (acc[report.jenisSatwa] || 0) + 1;
    return acc;
  }, {});
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  return {
    labels,
    datasets: [{
      label: 'Jumlah Laporan',
      data,
      backgroundColor: [ 'rgba(56, 102, 65, 0.7)', 'rgba(106, 153, 78, 0.7)', 'rgba(167, 201, 87, 0.7)', 'rgba(167, 123, 14, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)' ],
      borderColor: [ 'rgb(56, 102, 65)', 'rgb(106, 153, 78)', 'rgb(167, 201, 87)', 'rgb(167, 123, 14)', 'rgb(255, 159, 64)', 'rgb(255, 99, 132)', 'rgb(54, 162, 235)' ],
      borderWidth: 1
    }]
  };
});

const laporanPerStatus = computed(() => {
  const counts = props.reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {});
  return {
    labels: Object.keys(counts),
    datasets: [{
      label: 'Status Laporan',
      data: Object.values(counts),
      backgroundColor: [ '#3B82F6', '#FBBF24', '#10B981', '#EF4444' ],
      hoverOffset: 4
    }]
  };
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-brand-green">Statistik</h2>
      <button 
        @click="emit('navigate', 'rekap-bulanan')" 
        class="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-green-light transition-colors"
      >
        Buat Rekap Bulanan
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard title="Total Laporan" :value="totalLaporan" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" color="bg-blue-500" />
      <StatCard title="Sedang Diproses" :value="laporanDiproses" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="bg-yellow-500" />
      <StatCard title="Laporan Selesai" :value="laporanSelesai" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-green-500" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md">
        <h3 class="font-semibold text-lg text-gray-800 mb-4">Laporan per Jenis Satwa</h3>
        <BarChart :chart-data="laporanPerSatwa" />
      </div>
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
        <h3 class="font-semibold text-lg text-gray-800 mb-4">Proporsi Status Laporan</h3>
        <DoughnutChart :chart-data="laporanPerStatus" />
      </div>
    </div>
  </div>
</template>