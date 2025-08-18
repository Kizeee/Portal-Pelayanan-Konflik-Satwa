<script setup>
import { ref, computed } from 'vue';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import html2pdf from 'html2pdf.js';

const emit = defineEmits(['navigate-back']);

// --- STATE MANAGEMENT ---
const selectedMonth = ref(new Date().getMonth() + 1); // Default bulan ini
const selectedYear = ref(new Date().getFullYear()); // Default tahun ini
const rekapData = ref(null);
const isLoading = ref(false);
const error = ref(null);
const rekapContent = ref(null); // Ref untuk area cetak PDF

// Opsi untuk dropdown
const months = [
  { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' },
  { value: 3, name: 'Maret' }, { value: 4, name: 'April' },
  { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
  { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' },
  { value: 9, name: 'September' }, { value: 10, name: 'Oktober' },
  { value: 11, name: 'November' }, { value: 12, name: 'Desember' }
];
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
});

// Fungsi untuk mengambil dan memproses data rekap
const generateRekap = async () => {
  isLoading.value = true;
  error.value = null;
  rekapData.value = null;

  try {
    const year = selectedYear.value;
    const month = selectedMonth.value - 1; // getMonth() berbasis 0 (0-11)
    
    // Tentukan tanggal awal dan akhir bulan yang dipilih
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59); // Hari terakhir bulan tsb

    // Buat query ke Firestore
    const q = query(
      collection(db, 'laporan'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    );

    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => doc.data());

    if (reports.length === 0) {
      throw new Error('Tidak ada laporan yang ditemukan untuk periode ini.');
    }

    // Hitung statistik
    const totalLaporan = reports.length;
    const statusCounts = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});
    const satwaCounts = reports.reduce((acc, report) => {
      acc[report.jenisSatwa] = (acc[report.jenisSatwa] || 0) + 1;
      return acc;
    }, {});

    rekapData.value = {
      totalLaporan,
      statusCounts,
      satwaCounts,
      periode: `${months[month].name} ${year}`,
    };

  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

// Fungsi untuk mengunduh rekap sebagai PDF
const downloadPDF = () => {
  const element = rekapContent.value;
  const options = {
    margin: 0.8,
    filename: `rekap_laporan_${months[selectedMonth.value - 1].name}_${selectedYear.value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().from(element).set(options).save();
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <button @click="emit('navigate-back')" class="text-brand-green-light hover:underline mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
      Kembali ke Dasbor
    </button>
    
    <div class="bg-white p-8 rounded-2xl shadow-lg">
      <h2 class="text-3xl font-bold text-brand-green mb-6">Rekap Laporan Bulanan</h2>
      
      <div class="flex flex-col sm:flex-row gap-4 items-end bg-gray-50 p-4 rounded-lg mb-8">
        <div class="flex-1 w-full">
          <label for="bulan" class="block text-sm font-semibold text-gray-700 mb-1">Bulan</label>
          <select v-model="selectedMonth" id="bulan" class="w-full px-4 py-2 border rounded-lg">
            <option v-for="month in months" :key="month.value" :value="month.value">{{ month.name }}</option>
          </select>
        </div>
        <div class="flex-1 w-full">
          <label for="tahun" class="block text-sm font-semibold text-gray-700 mb-1">Tahun</label>
          <select v-model="selectedYear" id="tahun" class="w-full px-4 py-2 border rounded-lg">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <button @click="generateRekap" :disabled="isLoading" class="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ isLoading ? 'Memuat...' : 'Buat Rekap' }}
        </button>
      </div>

      <div v-if="error" class="text-center bg-red-100 text-red-700 p-4 rounded-lg">
        {{ error }}
      </div>

      <div v-if="rekapData" class="mt-6">
        <div ref="rekapContent" class="p-4 border rounded-lg">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800">Laporan Rekapitulasi Bulanan</h3>
            <p class="text-lg text-gray-600">Periode: {{ rekapData.periode }}</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 class="text-xl font-semibold mb-3 border-b pb-2">Ringkasan Status</h4>
              <p class="mb-2 text-lg"><strong>Total Laporan:</strong> {{ rekapData.totalLaporan }}</p>
              <ul class="space-y-1 list-disc list-inside">
                <li v-for="(count, status) in rekapData.statusCounts" :key="status">
                  {{ status }}: <strong>{{ count }}</strong>
                </li>
              </ul>
            </div>
            <div>
              <h4 class="text-xl font-semibold mb-3 border-b pb-2">Rincian Jenis Satwa</h4>
              <ul class="space-y-1 list-disc list-inside">
                <li v-for="(count, satwa) in rekapData.satwaCounts" :key="satwa">
                  {{ satwa }}: <strong>{{ count }}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="text-right mt-6">
          <button @click="downloadPDF" class="bg-gray-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-800">
            Download Rekap (PDF)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>