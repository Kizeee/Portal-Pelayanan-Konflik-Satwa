<script setup>
import { ref, watch, computed } from 'vue';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import html2pdf from 'html2pdf.js'; // <-- BARU: Impor library

const props = defineProps({
  report: Object,
  user: Object,
});

const emit = defineEmits(['navigate-back', 'report-updated']);

const isSubmitting = ref(false);
const currentStatus = ref(props.report?.status || '');
const adminNotes = ref('');

const reversedHistory = computed(() => {
  if (props.report && props.report.statusHistory) {
    return props.report.statusHistory.slice().reverse();
  }
  return [];
});

watch(() => props.report, (newReport) => {
  if (newReport) {
    currentStatus.value = newReport.status;
  }
});

const updateLaporanStatus = async () => {
  if (!props.report || props.report.status === currentStatus.value) {
    alert("Status belum diubah.");
    return;
  }
  
  isSubmitting.value = true;
  const docRef = doc(db, "laporan", props.report.id);
  
  const historyEntry = {
    status: currentStatus.value,
    timestamp: new Date(),
    updatedBy: props.user.email,
    notes: adminNotes.value || 'Status diperbarui.'
  };

  try {
    await updateDoc(docRef, {
      status: currentStatus.value,
      statusHistory: arrayUnion(historyEntry)
    });
    adminNotes.value = '';
    emit('report-updated');
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Gagal memperbarui status.");
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateInput, includeTime = true) => {
  if (!dateInput) return 'N/A';
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  if (isNaN(date)) return 'Tanggal tidak valid';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: includeTime ? '2-digit' : undefined, minute: includeTime ? '2-digit' : undefined };
  return date.toLocaleDateString('id-ID', options);
};

const statusClass = (status) => {
  const classes = { 'Diterima': 'bg-blue-100 text-blue-800', 'Diproses': 'bg-yellow-100 text-yellow-800', 'Selesai': 'bg-green-100 text-green-800', 'Tidak Valid': 'bg-red-100 text-red-800' };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// --- LOGIKA UNTUK DOWNLOAD PDF ---
const reportPdfContent = ref(null); // <-- BARU: Ref untuk elemen HTML

const downloadPDF = () => {
  const element = reportPdfContent.value;
  const options = {
    margin:       [0.7, 0.7, 0.7, 0.7], // Margin dalam inch
    filename:     `laporan-${props.report.id}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().from(element).set(options).save();
};

</script>

<template>
  <div v-if="report" class="max-w-4xl mx-auto">
    <button @click="emit('navigate-back')" class="text-brand-green-light hover:underline mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      Kembali ke Daftar Laporan
    </button>
    
    <div ref="reportPdfContent" class="bg-white p-8 rounded-2xl shadow-lg">
      <div class="flex justify-between items-start mb-6 border-b pb-6">
        <div>
          <h2 class="text-4xl font-bold text-brand-green">{{ report.jenisSatwa }}</h2>
          <p class="text-gray-500 mt-1">ID Laporan: {{ report.id }}</p>
        </div>
        <span :class="statusClass(report.status)" class="text-base font-semibold px-4 py-2 rounded-full">{{ report.status }}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
        <div><p class="font-semibold text-gray-500">Nama Pelapor</p><p class="text-lg">{{ report.nama }}</p></div>
        <div><p class="font-semibold text-gray-500">Telepon</p><p class="text-lg">{{ report.telepon }}</p></div>
        <div><p class="font-semibold text-gray-500">Tanggal Kejadian</p><p class="text-lg">{{ formatDate(report.tanggal, false) }}</p></div>
        <div><p class="font-semibold text-gray-500">Tanggal Dilaporkan</p><p class="text-lg">{{ formatDate(report.createdAt) }}</p></div>
        <div class="md:col-span-2"><p class="font-semibold text-gray-500">Lokasi</p><p class="text-lg">{{ report.lokasi }}</p></div>
        <div class="md:col-span-2"><p class="font-semibold text-gray-500">Koordinat</p><p class="text-lg font-mono text-blue-600 bg-gray-100 px-2 py-1 rounded inline-block">{{ report.lat }}, {{ report.lng }}</p></div>
        <div class="md:col-span-2"><p class="font-semibold text-gray-500">Deskripsi</p><p class="text-lg whitespace-pre-wrap bg-gray-100 p-4 rounded-md">{{ report.deskripsi }}</p></div>
      </div>
    </div>
    
    <div v-if="user" class="bg-white p-8 rounded-2xl shadow-lg mt-6">
      <h3 class="text-xl font-bold mb-4 text-brand-green">Panel Admin</h3>
      <div class="bg-gray-50 p-4 rounded-lg">
        <label for="status-select" class="block text-sm font-semibold text-gray-700 mb-1">Ubah Status Laporan</label>
        <div class="flex items-center space-x-4">
          <select id="status-select" v-model="currentStatus" class="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light">
            <option>Diterima</option><option>Diproses</option><option>Selesai</option><option>Tidak Valid</option>
          </select>
          <button @click="updateLaporanStatus" :disabled="isSubmitting" class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">{{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}</button>
        </div>
        <div class="mt-4">
          <label for="admin-notes" class="block text-sm font-semibold text-gray-700 mb-1">Tambah Catatan (Opsional)</label>
          <input type="text" v-model="adminNotes" id="admin-notes" placeholder="Contoh: Tim patroli sudah dikirim ke lokasi." class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light">
        </div>
      </div>
      
      <div class="mt-6 text-right">
        <button @click="downloadPDF" class="bg-red-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" /></svg>
          <span>Download Laporan (PDF)</span>
        </button>
      </div>

      <div v-if="report.statusHistory && report.statusHistory.length > 0" class="mt-8 border-t pt-6">
        <h4 class="font-semibold text-lg text-gray-800 mb-4">Riwayat Penanganan</h4>
        <ol class="relative border-l border-gray-200">
          <li v-for="(item, index) in reversedHistory" :key="index" class="mb-8 ml-6">
            <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-800" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
            </span>
            <h5 class="flex items-center mb-1 text-base font-semibold text-gray-900">
              Status: <span :class="statusClass(item.status)" class="ml-2 text-sm font-semibold px-2 py-0.5 rounded-full">{{ item.status }}</span>
            </h5>
            <time class="block mb-2 text-sm font-normal leading-none text-gray-400">{{ formatDate(item.timestamp) }}</time>
            <p class="text-sm text-gray-500">Oleh: <span class="font-medium">{{ item.updatedBy }}</span></p>
            <p v-if="item.notes" class="mt-1 text-sm p-2 bg-gray-100 rounded-md">Catatan: {{ item.notes }}</p>
          </li>
        </ol>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-10">
    <p class="text-lg text-gray-600">Laporan tidak ditemukan. Silakan kembali ke daftar.</p>
    <button @click="emit('navigate-back')" class="mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700">Kembali</button>
  </div>
</template>