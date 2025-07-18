<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  reports: Array,
});

const emit = defineEmits(['view-detail']);

const searchQuery = ref('');
const selectedStatus = ref('Semua');
const selectedSatwa = ref('Semua');
const currentPage = ref(1);
const itemsPerPage = ref(5);

const filteredReports = computed(() => {
  let reports = props.reports;
  if (searchQuery.value.trim() !== '') {
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    reports = reports.filter(report =>
      report.lokasi.toLowerCase().includes(lowerCaseQuery) ||
      report.deskripsi.toLowerCase().includes(lowerCaseQuery)
    );
  }
  if (selectedStatus.value !== 'Semua') {
    reports = reports.filter(report => report.status === selectedStatus.value);
  }
  if (selectedSatwa.value !== 'Semua') {
    reports = reports.filter(report => report.jenisSatwa === selectedSatwa.value);
  }
  return reports;
});

watch([searchQuery, selectedStatus, selectedSatwa], () => {
  currentPage.value = 1;
});

const totalPages = computed(() => {
  return Math.ceil(filteredReports.value.length / itemsPerPage.value);
});

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReports.value.slice(start, end);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const statusOptions = ['Semua', 'Diterima', 'Diproses', 'Selesai', 'Tidak Valid'];
const satwaOptions = computed(() => {
  const satwaSet = new Set(props.reports.map(r => r.jenisSatwa));
  return ['Semua', ...Array.from(satwaSet)];
});

const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  if (isNaN(date)) return 'Tanggal tidak valid';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('id-ID', options);
};

const statusClass = (status) => {
  const classes = { 'Diterima': 'bg-blue-100 text-blue-800', 'Diproses': 'bg-yellow-100 text-yellow-800', 'Selesai': 'bg-green-100 text-green-800', 'Tidak Valid': 'bg-red-100 text-red-800' };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-center mb-8">
      <h2 class="text-3xl font-bold text-brand-green mb-4 md:mb-0">Daftar Laporan Masuk</h2>
      <div class="w-full md:w-auto">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Cari lokasi atau deskripsi..."
          class="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light"
        />
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <label for="filter-status" class="block text-sm font-semibold text-gray-700 mb-1">Filter Status</label>
        <select id="filter-status" v-model="selectedStatus" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light">
          <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
      <div class="flex-1">
        <label for="filter-satwa" class="block text-sm font-semibold text-gray-700 mb-1">Filter Jenis Satwa</label>
        <select id="filter-satwa" v-model="selectedSatwa" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light">
          <option v-for="satwa in satwaOptions" :key="satwa" :value="satwa">{{ satwa }}</option>
        </select>
      </div>
    </div>

    <div v-if="filteredReports.length === 0" class="bg-white p-8 rounded-xl shadow-lg text-center text-gray-500">
      <p class="font-semibold text-lg">Tidak ada laporan yang cocok.</p>
      <p class="mt-1">Coba ubah kata kunci pencarian atau filter Anda.</p>
    </div>
    <div v-else>
      <div class="space-y-4">
        <div v-for="laporan in paginatedReports" :key="laporan.id" class="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-xl hover:border-brand-accent transition-all duration-300 cursor-pointer" @click="emit('view-detail', laporan.id)">
          <div class="flex flex-col md:flex-row justify-between items-start">
            <div class="flex-grow mb-4 md:mb-0">
              <p class="font-bold text-xl text-brand-green">{{ laporan.jenisSatwa }}</p>
              <p class="text-gray-600 flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                {{ laporan.lokasi }}
              </p>
              <p class="text-sm text-gray-500 mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                Dilaporkan pada: {{ formatDate(laporan.createdAt) }}
              </p>
            </div>
            <div class="flex items-center space-x-4 mt-2 md:mt-0">
              <span :class="statusClass(laporan.status)" class="text-sm font-semibold px-3 py-1 rounded-full">{{ laporan.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center space-x-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
          &lt;&lt;
        </button>
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-4 py-2 border rounded-lg',
            currentPage === page ? 'bg-brand-green text-white' : 'hover:bg-gray-100'
          ]">
          {{ page }}
        </button>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
          &gt;&gt;
        </button>
      </div>
    </div>
  </div>
</template>