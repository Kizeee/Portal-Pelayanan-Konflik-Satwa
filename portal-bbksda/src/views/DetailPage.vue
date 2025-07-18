<script setup>
import { ref, watch, computed } from 'vue';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'; // <-- Import arrayUnion
import { db } from '../firebase';

const props = defineProps({
  report: Object,
  user: Object,
});

const emit = defineEmits(['navigate-back', 'report-updated']);

const isSubmitting = ref(false);
const currentStatus = ref(props.report?.status || '');
const adminNotes = ref(''); // <-- State baru untuk catatan admin

// PERUBAHAN: Buat computed property untuk membalik urutan riwayat
const reversedHistory = computed(() => {
  if (props.report && props.report.statusHistory) {
    // slice() untuk membuat salinan sebelum dibalik, agar tidak mengubah data asli
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
  
  // PERUBAHAN: Buat objek riwayat baru
  const historyEntry = {
    status: currentStatus.value,
    timestamp: new Date(),
    updatedBy: props.user.email,
    notes: adminNotes.value || 'Status diperbarui.' // Gunakan catatan atau teks default
  };

  try {
    // PERUBAHAN: Gunakan arrayUnion untuk menambahkan riwayat baru
    await updateDoc(docRef, {
      status: currentStatus.value,
      statusHistory: arrayUnion(historyEntry)
    });
    adminNotes.value = ''; // Kosongkan catatan setelah berhasil
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
</script>

<template>
  <div v-if="report" class="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
    <button @click="emit('navigate-back')" class="text-brand-green-light hover:underline mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      Kembali ke Daftar Laporan
    </button>
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
      <div class="md:col-span-2"><p class="font-semibold text-gray-500">Koordinat</p><a :href="`https://www.google.com/maps/search/?api=1&query=${report.lat},${report.lng}`" target="_blank" rel="noopener noreferrer" class="text-lg font-mono text-blue-600 hover:underline bg-gray-100 px-2 py-1 rounded inline-flex items-center space-x-2"><span>{{ report.lat }}, {{ report.lng }}</span><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a></div>
      <div class="md:col-span-2"><p class="font-semibold text-gray-500">Deskripsi</p><p class="text-lg whitespace-pre-wrap bg-gray-100 p-4 rounded-md">{{ report.deskripsi }}</p></div>
    </div>
    
    <!-- PANEL ADMIN -->
    <div v-if="user" class="mt-8 border-t pt-6">
      <h3 class="text-xl font-bold mb-4 text-brand-green">Panel Admin</h3>
      <div class="bg-gray-50 p-4 rounded-lg">
        <label for="status-select" class="block text-sm font-semibold text-gray-700 mb-1">Ubah Status Laporan</label>
        <div class="flex items-center space-x-4">
          <select id="status-select" v-model="currentStatus" class="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light">
            <option>Diterima</option><option>Diproses</option><option>Selesai</option><option>Tidak Valid</option>
          </select>
          <button @click="updateLaporanStatus" :disabled="isSubmitting" class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">{{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}</button>
        </div>
        <div class="mt-4">
          <label for="admin-notes" class="block text-sm font-semibold text-gray-700 mb-1">Tambah Catatan (Opsional)</label>
          <input type="text" v-model="adminNotes" id="admin-notes" placeholder="Contoh: Tim patroli sudah dikirim ke lokasi." class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light">
        </div>
      </div>
      
      <!-- TAMPILAN TIMELINE BARU -->
      <div v-if="report.statusHistory && report.statusHistory.length > 0" class="mt-8">
        <h4 class="font-semibold text-lg text-gray-800 mb-4">Riwayat Penanganan</h4>
        <ol class="relative border-l border-gray-200">                  
          <li v-for="(item, index) in reversedHistory" :key="index" class="mb-8 ml-6">            
            <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-800" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
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