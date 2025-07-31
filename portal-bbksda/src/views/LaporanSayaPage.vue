<script setup>
import { computed } from 'vue';

const props = defineProps({
  myReports: Array,
});

const emit = defineEmits(['view-detail', 'navigate', 'edit-report']);

const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  if (isNaN(date)) return 'Tanggal tidak valid';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('id-ID', options);
};

const statusClass = (status) => {
  const classes = { 
    'Diterima': 'bg-blue-100 text-blue-800', 
    'Diproses': 'bg-yellow-100 text-yellow-800', 
    'Selesai': 'bg-green-100 text-green-800', 
    'Tidak Valid': 'bg-red-100 text-red-800' 
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const canBeEdited = (status) => {
  return status === 'Diterima'; 
};

// Fungsi untuk event klik pada tombol edit
const handleEditClick = (laporanId) => {
  emit('edit-report', laporanId);
};
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6 text-brand-green">Laporan yang Pernah Anda Kirim</h2>
    
    <div v-if="!myReports || myReports.length === 0" class="bg-white p-8 rounded-xl shadow-lg text-center text-gray-500">
      <p class="font-semibold text-lg">Anda belum pernah mengirim laporan.</p>
      <p class="mt-2">Silakan buat laporan baru untuk melihatnya di sini.</p>
      <button @click="emit('navigate', 'lapor')" class="mt-4 bg-brand-green text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-green-light transition-colors">
        Buat Laporan
      </button>
    </div>

    <div v-else class="space-y-4">
      <div v-for="laporan in myReports" :key="laporan.id" class="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-xl hover:border-brand-accent transition-all duration-300">
        <div class="flex flex-col md:flex-row justify-between items-start">
          <div class="flex-grow mb-4 md:mb-0 cursor-pointer" @click="emit('view-detail', laporan.id)">
            <p class="font-bold text-xl text-brand-green">{{ laporan.jenisSatwa }}</p>
            <p class="text-gray-600 flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
              {{ laporan.lokasi }}
            </p>
            <p class="text-sm text-gray-500 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
              Dilaporkan pada: {{ formatDate(laporan.createdAt) }}
            </p>
          </div>
          
          <div class="flex items-center space-x-4 self-start md:self-center">
            <span :class="statusClass(laporan.status)" class="text-sm font-semibold px-3 py-1 rounded-full">{{ laporan.status }}</span>
            
            <button 
              v-if="canBeEdited(laporan.status)" 
              @click.stop="handleEditClick(laporan.id)" 
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold p-2 rounded-full transition-colors"
              aria-label="Edit Laporan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>