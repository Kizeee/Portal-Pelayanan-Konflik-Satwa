<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReportsStore } from '../stores/reports';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';
import { useReports } from '../composables/useReports';
import { arrayUnion } from 'firebase/firestore';
import html2pdf from 'html2pdf.js';

const route = useRoute();
const router = useRouter();
const reportsStore = useReportsStore();
const authStore = useAuthStore();
const uiStore = useUIStore();
const { updateReport } = useReports();

// Get report from store based on route ID
const reportId = route.params.id;
const report = computed(() => {
  return reportsStore.reports.find(r => r.id === reportId);
});

const currentStatus = ref(report.value?.status || '');
const adminNotes = ref('');

onMounted(() => {
  if (report.value) {
    currentStatus.value = report.value.status;
  }
});

const reversedHistory = computed(() => {
  const historyField = report.value?.statusHistory || [];
  return historyField.slice().reverse();
});

watch(() => report.value, (newReport) => {
  if (newReport) {
    currentStatus.value = newReport.status;
  }
});

const updateLaporanStatus = async () => {
  if (!report.value || report.value.status === currentStatus.value) {
    return;
  }
  isSubmitting.value = true;
  
  const historyEntry = {
    status: currentStatus.value,
    timestamp: new Date(),
    updatedBy: authStore.user?.email || 'Admin',
    notes: adminNotes.value.trim() || ''
  };
  
  try {
    await updateReport(report.value.id, {
      status: currentStatus.value,
      statusHistory: arrayUnion(historyEntry)
    });
    
    adminNotes.value = '';
    await reportsStore.loadReports();
    uiStore.showNotification('success', 'Berhasil', 'Status laporan berhasil diperbarui.');
  } catch (error) {
    console.error("Gagal memperbarui status:", error);
    uiStore.showNotification('error', 'Gagal', 'Gagal memperbarui status laporan.');
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
  const classes = {
    'Menunggu Verifikasi': 'bg-yellow-100 text-yellow-800',
    pending: 'bg-yellow-100 text-yellow-800', // backward compatibility
    Diterima: 'bg-blue-100 text-blue-800',
    verified: 'bg-blue-100 text-blue-800', // backward compatibility
    'Tim Menuju Lokasi': 'bg-emerald-100 text-emerald-800',
    'Penanganan di Lokasi': 'bg-yellow-100 text-yellow-800',
    Diproses: 'bg-yellow-100 text-yellow-800', // backward compatibility
    Selesai: 'bg-green-100 text-green-800',
    Ditolak: 'bg-red-100 text-red-800',
    'Tidak Valid': 'bg-red-100 text-red-800', // backward compatibility
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const reportPdfContent = ref(null);
const downloadPDF = () => {
  const element = reportPdfContent.value;
  const options = {
    margin: [0.7, 0.7, 0.7, 0.7],
    filename: `laporan-${report.value.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().from(element).set(options).save();
};

const navigateBack = () => {
  if (authStore.user) {
    router.push({ name: 'LihatLaporan' });
  } else {
    router.push({ name: 'LaporanSaya' });
  }
};

const isSubmitting = ref(false);
</script>

<template>
  <div v-if="report" class="max-w-4xl mx-auto">
    <button @click="navigateBack" class="text-brand-green-light hover:underline mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
      Kembali ke Daftar Laporan
    </button>
    
    <div ref="reportPdfContent" class="bg-white p-8 rounded-2xl shadow-lg">
      <div class="flex justify-between items-start mb-6 border-b pb-6">
        <div>
          <h2 class="text-4xl font-bold text-brand-green">{{ report.jenisSatwa }}</h2>
          <p class="text-gray-500 mt-1">ID Laporan: {{ report.idLaporan || report.id }}</p>
        </div>
        <span :class="statusClass(report.status)" class="text-base font-semibold px-4 py-2 rounded-full">{{ report.status }}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
        <div><p class="font-semibold text-gray-500">Nama Pelapor</p><p class="text-lg">{{ report.nama }}</p></div>
        <div><p class="font-semibold text-gray-500">Telepon</p><p class="text-lg">{{ report.telepon }}</p></div>
        <div><p class="font-semibold text-gray-500">Tanggal Kejadian</p><p class="text-lg">{{ formatDate(report.tanggal, false) }}</p></div>
        <div><p class="font-semibold text-gray-500">Tanggal Dilaporkan</p><p class="text-lg">{{ formatDate(report.createdAt) }}</p></div>
        <div><p class="font-semibold text-gray-500">Kategori Konflik</p><p class="text-lg">{{ report.kategoriKonflik || '-' }}</p></div>
        <div class="md:col-span-2"><p class="font-semibold text-gray-500">Lokasi</p><p class="text-lg">{{ report.lokasi }}</p></div>
        
        <div class="md:col-span-2">
          <p class="font-semibold text-gray-500">Koordinat</p>
          <a 
            :href="`https://www.google.com/maps?q=${report.lat},${report.lng}`" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-lg font-mono text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded inline-block transition-colors cursor-pointer underline" 
            title="Buka di Google Maps"
          >
            {{ report.lat }}, {{ report.lng }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block ml-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          </a>
        </div>

        <div class="md:col-span-2"><p class="font-semibold text-gray-500">Deskripsi</p><p class="text-lg whitespace-pre-wrap bg-gray-100 p-4 rounded-md">{{ report.deskripsi }}</p></div>
        <div v-if="report.estimasi_kerugian || report.estimasi_kerugian === 0"><p class="font-semibold text-gray-500">Estimasi Kerugian</p><p class="text-lg">Rp {{ new Intl.NumberFormat('id-ID').format(report.estimasi_kerugian) }}</p></div>
        <div v-if="report.status_satwa_akhir"><p class="font-semibold text-gray-500">Status Satwa Akhir</p><p class="text-lg">{{ report.status_satwa_akhir }}</p></div>
        
        <div v-if="report.videoUrl" class="md:col-span-2 mb-6">
          <p class="font-semibold text-gray-500 mb-2">Video Kejadian</p>
          <a :href="report.videoUrl" target="_blank" rel="noopener noreferrer" class="relative block w-full max-w-sm bg-black rounded-lg group cursor-pointer shadow-md overflow-hidden" style="aspect-ratio: 16 / 9;">
            <div class="absolute inset-0 bg-black opacity-40 group-hover:opacity-50 transition-opacity"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center group-hover:bg-white/50 group-hover:scale-110 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>
              </div>
            </div>
            <div class="absolute bottom-2 left-3 text-white text-xs font-semibold">Klik untuk memutar video</div>
          </a>
        </div>

        <div v-if="report.imageUrls && report.imageUrls.length > 0" class="md:col-span-2">
          <p class="font-semibold text-gray-500">Foto Kejadian</p>
          <div class="mt-2 grid grid-cols-2 gap-4">
            <div v-for="(url, index) in report.imageUrls" :key="index">
              <a :href="url" target="_blank" rel="noopener noreferrer">
                <img :src="url" alt="Foto Kejadian" class="w-full h-48 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-if="reversedHistory.length > 0" class="mt-8 border-t pt-6">
        <h4 class="font-semibold text-lg text-gray-800 mb-4">Riwayat Penanganan Laporan</h4>
        <ol class="relative border-l border-gray-200">
          <li v-for="(item, index) in reversedHistory" :key="index" class="mb-8 ml-6">
            <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-800" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
            </span>
            <h5 class="flex items-center mb-1 text-base font-semibold text-gray-900">
              Status: <span :class="statusClass(item.status)" class="ml-2 text-sm font-semibold px-2 py-0.5 rounded-full">{{ item.status }}</span>
            </h5>
            <time class="block mb-2 text-sm font-normal leading-none text-gray-400">{{ formatDate(item.timestamp) }}</time>
            <p v-if="item.updatedBy" class="text-sm text-gray-500">Oleh: <span class="font-medium">{{ item.updatedBy }}</span></p>
            <p v-if="item.notes" class="mt-1 text-sm p-2 bg-gray-100 rounded-md">Catatan: {{ item.notes }}</p>
          </li>
        </ol>
      </div>
    </div>
    
    <div v-if="authStore.user" class="bg-white p-8 rounded-2xl shadow-lg mt-6">
      <h3 class="text-xl font-bold mb-4 text-brand-green">Panel Admin</h3>
      <div class="bg-gray-50 p-4 rounded-lg">
        <label for="status-select" class="block text-sm font-semibold text-gray-700 mb-1">Ubah Status Laporan</label>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <select id="status-select" v-model="currentStatus" class="w-full sm:w-auto sm:min-w-[220px] px-4 py-2 border rounded-lg">
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option v-if="currentStatus === 'pending'" value="pending">Pending (Lama)</option>
            <option value="Diterima">Diterima</option>
            <option v-if="currentStatus === 'verified'" value="verified">Verified (Lama)</option>
            <option value="Tim Menuju Lokasi">Tim Menuju Lokasi</option>
            <option value="Penanganan di Lokasi">Penanganan di Lokasi</option>
            <option v-if="currentStatus === 'Diproses'" value="Diproses">Diproses (Lama)</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
            <option v-if="currentStatus === 'Tidak Valid'" value="Tidak Valid">Tidak Valid (Lama)</option>
          </select>
          <button @click="updateLaporanStatus" :disabled="isSubmitting" class="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}</button>
        </div>
        <div class="mt-4">
          <label for="admin-notes" class="block text-sm font-semibold text-gray-700 mb-1">Tambah Catatan</label>
          <input type="text" v-model="adminNotes" id="admin-notes" placeholder="Contoh: Tim patroli sudah dikirim." class="w-full px-4 py-2 border rounded-lg">
        </div>
      </div>
      <div class="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
        <button @click="downloadPDF" class="w-full sm:w-auto bg-gray-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-800">
          <span>Download Laporan (PDF)</span>
        </button>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-10">
    <p class="text-lg text-gray-600">Laporan tidak ditemukan.</p>
    <button @click="navigateBack" class="mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700">Kembali</button>
  </div>
</template>
