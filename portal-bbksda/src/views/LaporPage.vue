<script setup>
import { ref } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import MapPicker from '../components/MapPicker.vue';

const emit = defineEmits(['report-submitted']);

const isSubmitting = ref(false);
const newLaporan = ref({ nama: '', telepon: '', tanggal: new Date().toISOString().slice(0, 10), jenisSatwa: '', lokasi: '', lat: '', lng: '', deskripsi: '' });
const errors = ref({});

const handleLocationUpdate = (coords) => {
  newLaporan.value.lat = coords.lat.toFixed(6);
  newLaporan.value.lng = coords.lng.toFixed(6);
};

const resetForm = () => {
  newLaporan.value = { nama: '', telepon: '', tanggal: new Date().toISOString().slice(0, 10), jenisSatwa: '', lokasi: '', lat: '', lng: '', deskripsi: '' };
};

const validateAndSubmit = async () => {
  errors.value = {};
  if (!newLaporan.value.nama) errors.value.nama = "Nama tidak boleh kosong.";
  if (!newLaporan.value.telepon) errors.value.telepon = "Telepon tidak boleh kosong.";
  else if (!/^[0-9]{10,14}$/.test(newLaporan.value.telepon)) errors.value.telepon = "Format nomor telepon tidak valid (10-14 digit).";
  if (!newLaporan.value.tanggal) errors.value.tanggal = "Tanggal tidak boleh kosong.";
  if (!newLaporan.value.jenisSatwa) errors.value.jenisSatwa = "Jenis satwa harus dipilih.";
  if (!newLaporan.value.lokasi) errors.value.lokasi = "Lokasi tidak boleh kosong.";
  if (!newLaporan.value.lat || !newLaporan.value.lng) errors.value.lokasi = "Silakan tentukan lokasi di peta.";
  if (!newLaporan.value.deskripsi) errors.value.deskripsi = "Deskripsi tidak boleh kosong.";
  
  if (Object.keys(errors.value).length === 0) {
    submitLaporan();
  }
};

const submitLaporan = async () => {
  isSubmitting.value = true;
  try {
    const reportData = {
      ...newLaporan.value,
      status: 'Diterima',
      createdAt: new Date(),
    };
    
    // Simpan laporan ke Firestore dan dapatkan referensi dokumennya
    const docRef = await addDoc(collection(db, "laporan"), reportData);

    // --- LOGIKA BARU: Simpan ID ke localStorage ---
    const myReportIds = JSON.parse(localStorage.getItem('myReportIds') || '[]');
    myReportIds.push(docRef.id);
    localStorage.setItem('myReportIds', JSON.stringify(myReportIds));
    
    resetForm();
    emit('report-submitted');

  } catch (error) {
    console.error("Error submitting report:", error);
    alert('Gagal mengirim laporan. Silakan coba lagi.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-lg">
    <h2 class="text-3xl font-bold mb-2 text-center text-brand-green">Formulir Pengaduan Konflik</h2>
    <p class="text-center text-gray-500 mb-8">Isi formulir di bawah ini dengan data yang akurat.</p>
    <form @submit.prevent="validateAndSubmit">
      <div class="space-y-6">
        <div>
          <label for="nama" class="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap Pelapor</label>
          <input type="text" v-model="newLaporan.nama" id="nama" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{'border-red-500': errors.nama}">
          <p v-if="errors.nama" class="text-red-600 text-sm mt-1">{{ errors.nama }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="telepon" class="block text-sm font-semibold text-gray-700 mb-1">Nomor Telepon/HP</label>
            <input type="tel" v-model="newLaporan.telepon" id="telepon" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{'border-red-500': errors.telepon}" placeholder="08...">
            <p v-if="errors.telepon" class="text-red-600 text-sm mt-1">{{ errors.telepon }}</p>
          </div>
          <div>
            <label for="tanggal" class="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kejadian</label>
            <input type="date" v-model="newLaporan.tanggal" id="tanggal" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{'border-red-500': errors.tanggal}">
            <p v-if="errors.tanggal" class="text-red-600 text-sm mt-1">{{ errors.tanggal }}</p>
          </div>
        </div>

        <div>
          <label for="satwa" class="block text-sm font-semibold text-gray-700 mb-1">Jenis Satwa</label>
          <select v-model="newLaporan.jenisSatwa" id="satwa" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{'border-red-500': errors.jenisSatwa}"><option disabled value="">Pilih jenis satwa</option><option>Gajah Sumatera</option><option>Harimau Sumatera</option><option>Beruang Madu</option><option>Buaya</option><option>Monyet/Kera</option><option>Lainnya</option></select>
          <p v-if="errors.jenisSatwa" class="text-red-600 text-sm mt-1">{{ errors.jenisSatwa }}</p>
        </div>

        <div>
          <label for="lokasi" class="block text-sm font-semibold text-gray-700 mb-1">Lokasi Kejadian (Desa/Kecamatan)</label>
          <input type="text" v-model="newLaporan.lokasi" id="lokasi" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{'border-red-500': errors.lokasi}" placeholder="Contoh: Desa Sialang, Kec. Pangkalan Kuras"><p v-if="errors.lokasi" class="error-message">{{ errors.lokasi }}</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Tentukan Lokasi di Peta</label>
          <MapPicker @location-selected="handleLocationUpdate" />
          <div class="flex space-x-4 mt-2">
            <input type="text" v-model="newLaporan.lat" class="w-1/2 px-4 py-2 border rounded-lg bg-gray-100" readonly placeholder="Latitude">
            <input type="text" v-model="newLaporan.lng" class="w-1/2 px-4 py-2 border rounded-lg bg-gray-100" readonly placeholder="Longitude">
          </div>
        </div>

        <div>
          <label for="deskripsi" class="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Singkat Kejadian</label>
          <textarea v-model="newLaporan.deskripsi" id="deskripsi" rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{'border-red-500': errors.deskripsi}" placeholder="Jelaskan apa yang terjadi..."></textarea>
          <p v-if="errors.deskripsi" class="text-red-600 text-sm mt-1">{{ errors.deskripsi }}</p>
        </div>
      </div>
      <div class="mt-8 text-right">
        <button type="submit" :disabled="isSubmitting" class="bg-gradient-to-r from-brand-green to-brand-green-light text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl transition-all duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
          {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
        </button>
      </div>
    </form>
  </div>
</template>