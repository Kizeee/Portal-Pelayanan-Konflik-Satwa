<script setup>
import { ref } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import MapPicker from '../components/MapPicker.vue';

const emit = defineEmits(['report-submitted']);

const isSubmitting = ref(false);
const newLaporan = ref({
  nama: '',
  telepon: '',
  tanggal: new Date().toISOString().slice(0, 10),
  jenisSatwa: '',
  lokasi: '',
  lat: '',
  lng: '',
  deskripsi: ''
});
const errors = ref({});
const selectedFile = ref(null); // State untuk menampung file gambar yang dipilih

// Fungsi untuk menangani perubahan pada input file
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file;
    errors.value.gambar = null; // Hapus error jika file valid
  } else {
    selectedFile.value = null;
    errors.value.gambar = 'Harap pilih file gambar yang valid (jpg, png, dll).';
  }
};

const handleLocationUpdate = (coords) => {
  newLaporan.value.lat = coords.lat.toFixed(6);
  newLaporan.value.lng = coords.lng.toFixed(6);
};

const resetForm = () => {
  newLaporan.value = {
    nama: '',
    telepon: '',
    tanggal: new Date().toISOString().slice(0, 10),
    jenisSatwa: '',
    lokasi: '',
    lat: '',
    lng: '',
    deskripsi: ''
  };
  selectedFile.value = null; // Reset file juga
  // Bersihkan input file secara manual jika perlu
  const fileInput = document.getElementById('gambar');
  if (fileInput) {
    fileInput.value = '';
  }
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
  // Validasi baru untuk gambar
  if (!selectedFile.value) errors.value.gambar = "Anda harus mengupload gambar kejadian.";
  
  if (Object.keys(errors.value).length === 0) {
    submitLaporan();
  }
};

const submitLaporan = async () => {
  isSubmitting.value = true;
  let imageUrl = '';

  try {
    const CLOUD_NAME = 'drjznlsij';
    const UPLOAD_PRESET = 'laporan_satwa_unsigned'; 
    
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Gagal upload gambar ke Cloudinary. Pastikan Cloud Name dan Upload Preset sudah benar.');
    }

    const data = await response.json();
    imageUrl = data.secure_url; // URL gambar dari Cloudinary

    // --- SIMPAN DATA KE FIRESTORE ---
    const reportData = {
      ...newLaporan.value,
      imageUrl: imageUrl, // Simpan URL gambar yang didapat dari Cloudinary
      status: 'Diterima',
      createdAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, "laporan"), reportData);

    const myReportIds = JSON.parse(localStorage.getItem('myReportIds') || '[]');
    myReportIds.push(docRef.id);
    localStorage.setItem('myReportIds', JSON.stringify(myReportIds));
    
    resetForm();
    emit('report-submitted');

  } catch (error) {
    console.error("Error submitting report:", error);
    alert(error.message || 'Gagal mengirim laporan. Silakan coba lagi.');
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
          <select v-model="newLaporan.jenisSatwa" id="satwa" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{'border-red-500': errors.jenisSatwa}">
            <option disabled value="">Pilih jenis satwa</option>
            <option>Gajah Sumatera</option>
            <option>Harimau Sumatera</option>
            <option>Beruang Madu</option>
            <option>Buaya</option>
            <option>Monyet/Kera</option>
            <option>Lainnya</option>
          </select>
          <p v-if="errors.jenisSatwa" class="text-red-600 text-sm mt-1">{{ errors.jenisSatwa }}</p>
        </div>
        
        <div>
          <label for="gambar" class="block text-sm font-semibold text-gray-700 mb-1">Upload Foto Kejadian (Wajib)</label>
          <input 
            type="file" 
            @change="handleFileChange" 
            id="gambar" 
            class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            :class="{'ring-2 ring-red-500 rounded-lg': errors.gambar}"
            accept="image/png, image/jpeg, image/jpg"
          >
          <p v-if="errors.gambar" class="text-red-600 text-sm mt-1">{{ errors.gambar }}</p>
          <div v-if="selectedFile" class="mt-4">
             <img :src="URL.createObjectURL(selectedFile)" alt="Preview Gambar" class="w-1/2 max-w-xs rounded-lg shadow-md">
          </div>
        </div>

        <div>
          <label for="lokasi" class="block text-sm font-semibold text-gray-700 mb-1">Lokasi Kejadian (Desa/Kecamatan)</label>
          <input type="text" v-model="newLaporan.lokasi" id="lokasi" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{'border-red-500': errors.lokasi}" placeholder="Contoh: Desa Sialang, Kec. Pangkalan Kuras">
          <p v-if="errors.lokasi" class="text-red-600 text-sm mt-1">{{ errors.lokasi }}</p>
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