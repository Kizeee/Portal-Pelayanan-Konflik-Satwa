<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  laporanToEdit: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close-modal', 'save-changes']);
const form = ref({
  nama: '',
  telepon: '',
  tanggal: '',
  jenisSatwa: '',
  lokasi: '',
  deskripsi: ''
});

watch(() => props.laporanToEdit, (newLaporan) => {
  if (newLaporan) {
    form.value.nama = newLaporan.nama || '';
    form.value.telepon = newLaporan.telepon || '';
    form.value.tanggal = newLaporan.tanggal ? new Date(newLaporan.tanggal).toISOString().slice(0, 10) : '';
    form.value.jenisSatwa = newLaporan.jenisSatwa || '';
    form.value.lokasi = newLaporan.lokasi || '';
    form.value.deskripsi = newLaporan.deskripsi || '';
  }
}, { immediate: true, deep: true });

const handleSubmit = () => {
  if (!form.value.nama.trim() || !form.value.telepon.trim() || !form.value.jenisSatwa.trim() || !form.value.lokasi.trim()) {
    alert('Mohon isi semua field yang wajib diisi.');
    return;
  }
  emit('save-changes', { ...form.value });
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-2xl font-bold text-brand-green">Edit Laporan</h3>
      <button @click="emit('close-modal')" class="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
    </div>
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
        
        <div>
          <label for="edit-nama" class="block text-sm font-medium text-gray-700">Nama Lengkap Pelapor</label>
          <input 
            type="text" 
            id="edit-nama" 
            v-model="form.nama" 
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
            required
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="edit-telepon" class="block text-sm font-medium text-gray-700">Nomor Telepon/HP</label>
              <input 
                type="tel" 
                id="edit-telepon" 
                v-model="form.telepon" 
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                required
              >
            </div>

            <div>
              <label for="edit-tanggal" class="block text-sm font-medium text-gray-700">Tanggal Kejadian</label>
              <input 
                type="date" 
                id="edit-tanggal" 
                v-model="form.tanggal" 
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                required
              >
            </div>
        </div>
        
        <div>
          <label for="edit-jenisSatwa" class="block text-sm font-medium text-gray-700">Jenis Satwa</label>
          <select v-model="form.jenisSatwa" id="edit-jenisSatwa" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent" required>
            <option disabled value="">Pilih jenis satwa</option>
            <option>Gajah Sumatera</option>
            <option>Harimau Sumatera</option>
            <option>Beruang Madu</option>
            <option>Buaya</option>
            <option>Monyet/Kera</option>
            <option>Lainnya</option>
          </select>
        </div>
        
        <div>
          <label for="edit-lokasi" class="block text-sm font-medium text-gray-700">Lokasi Kejadian</label>
          <input 
            type="text" 
            id="edit-lokasi" 
            v-model="form.lokasi" 
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
            required
          >
        </div>

        <div>
          <label for="edit-deskripsi" class="block text-sm font-medium text-gray-700">Deskripsi Singkat Kejadian</label>
          <textarea 
            id="edit-deskripsi" 
            v-model="form.deskripsi" 
            rows="4" 
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
          ></textarea>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3 border-t pt-4">
        <button 
          type="button" 
          @click="emit('close-modal')" 
          class="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Batal
        </button>
        <button 
          type="submit" 
          class="bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-light transition-colors"
        >
          Simpan Perubahan
        </button>
      </div>
    </form>
  </div>
</template>