<script setup>
import { ref, onUnmounted } from 'vue';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import MapPicker from '../components/MapPicker.vue';

const emit = defineEmits(['report-submitted']);

// --- STATE MANAGEMENT ---
const isSubmitting = ref(false);
const newLaporan = ref({
  nama: '',
  telepon: '',
  tanggal: new Date().toISOString().slice(0, 10),
  jenisSatwa: '',
  lokasi: '', // Field ini yang akan diisi oleh input baru
  lat: null,
  lng: null,
  deskripsi: '',
  idLaporan: '',
});
const errors = ref({});

// --- PERUBAHAN #1: State untuk menampung gambar DAN video ---
const selectedFiles = ref([]);       // Menampung semua file (gambar dan video)
const previewUrls = ref([]);         // Menampung URL preview beserta tipenya
const fileInputRef = ref(null);

// --- Fungsi untuk mendapatkan ID Laporan terakhir ---
const getLastLaporanId = async () => {
  const q = query(collection(db, 'laporan'), orderBy('idLaporan', 'desc'), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const lastDoc = querySnapshot.docs[0];
    return lastDoc.data().idLaporan;
  }
  return null;
};

// --- Fungsi untuk generate ID Laporan baru ---
const generateNewLaporanId = async () => {
  const lastId = await getLastLaporanId();
  if (lastId) {
    const lastNumber = parseInt(lastId.replace('LP', ''), 10);
    const newNumber = lastNumber + 1;
    return `LP${newNumber.toString().padStart(3, '0')}`;
  }
  return 'LP001';
};

// --- PERUBAHAN #2: Fungsi untuk menangani input gambar dan video ---
const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  // Hapus URL preview lama untuk mencegah memory leak
  previewUrls.value.forEach(p => URL.revokeObjectURL(p.url));

  // Validasi: Pastikan hanya ada maksimal 1 video
  const videoFiles = files.filter(file => file.type.startsWith('video/'));
  if (videoFiles.length > 1) {
    alert("Anda hanya dapat mengunggah maksimal 1 video.");
    fileInputRef.value.value = ''; // Reset input
    return;
  }

  // Validasi: Batasi jumlah gambar (misal: maks 5)
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  if (imageFiles.length > 5) {
      alert("Anda hanya dapat mengunggah maksimal 5 gambar.");
      fileInputRef.value.value = ''; // Reset input
      return;
  }

  selectedFiles.value = files;
  errors.value.gambar = null;

  // Buat URL preview baru, simpan juga tipenya (image/video)
  previewUrls.value = selectedFiles.value.map(file => ({
    url: URL.createObjectURL(file),
    type: file.type.startsWith('video/') ? 'video' : 'image'
  }));
};

// Pastikan semua URL preview dibersihkan saat komponen ditutup
onUnmounted(() => {
  previewUrls.value.forEach(p => URL.revokeObjectURL(p.url));
});

const handleLocationUpdate = (coords) => {
  newLaporan.value.lat = coords.lat.toFixed(6);
  newLaporan.value.lng = coords.lng.toFixed(6);
  // Hapus error lokasi peta jika ada, karena peta sudah dipilih
  if (errors.value.lokasiPeta) {
    errors.value.lokasiPeta = null;
  }
};

const resetForm = () => {
  newLaporan.value = {
    nama: '',
    telepon: '',
    tanggal: new Date().toISOString().slice(0, 10),
    jenisSatwa: '',
    lokasi: '',
    lat: null,
    lng: null,
    deskripsi: '',
    idLaporan: '',
  };
  selectedFiles.value = [];
  previewUrls.value = [];
  errors.value = {};
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const validateAndSubmit = () => {
  errors.value = {};
  if (!newLaporan.value.nama.trim()) errors.value.nama = 'Nama tidak boleh kosong.';
  if (!newLaporan.value.telepon.trim()) errors.value.telepon = 'Telepon tidak boleh kosong.';
  else if (!/^08[0-9]{8,12}$/.test(newLaporan.value.telepon))
    errors.value.telepon = 'Format nomor telepon tidak valid (contoh: 081234567890).';
  if (!newLaporan.value.jenisSatwa) errors.value.jenisSatwa = 'Jenis satwa harus dipilih.';
  
  // Validasi field lokasi yang baru ditambahkan
  if (!newLaporan.value.lokasi.trim()) errors.value.lokasi = 'Detail lokasi tidak boleh kosong.';
  
  if (selectedFiles.value.length === 0)
    errors.value.gambar = 'Anda harus mengunggah setidaknya satu gambar atau video.';
  
  // Validasi tambahan untuk memastikan peta sudah dipilih
  if (newLaporan.value.lat === null || newLaporan.value.lng === null) {
      errors.value.lokasiPeta = 'Silakan tentukan titik lokasi di peta.';
  }

  if (Object.keys(errors.value).length === 0) {
    submitLaporan();
  }
};

// --- PERUBAHAN #3: Fungsi submit untuk mengunggah gambar DAN video ---
const submitLaporan = async () => {
  isSubmitting.value = true;

  try {
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'drjznlsij';
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'laporan_satwa_unsigned';

    // Proses upload untuk setiap file
    const uploadPromises = selectedFiles.value.map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      // Tentukan tipe resource (image/video) untuk Cloudinary
      const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
      const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

      return fetch(apiUrl, {
        method: 'POST',
        body: formData,
      }).then((response) => {
        if (!response.ok) throw new Error('Gagal mengunggah file ke Cloudinary.');
        return response.json();
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Pisahkan URL gambar dan video setelah diunggah
    const imageUrls = uploadResults
      .filter(result => result.resource_type === 'image')
      .map(result => result.secure_url);

    const videoUrl = uploadResults
      .find(result => result.resource_type === 'video')?.secure_url || null;

    // Generate ID Laporan baru
    const newId = await generateNewLaporanId();
    newLaporan.value.idLaporan = newId;

    // Siapkan data untuk disimpan ke Firestore
    const reportData = {
      ...newLaporan.value,
      imageUrls: imageUrls, // Simpan sebagai array 'imageUrls'
      videoUrl: videoUrl,   // Simpan 'videoUrl' (bisa null jika tidak ada)
      status: 'Diterima',
      createdAt: new Date(),
    };

    // Gunakan setDoc dengan ID kustom
    const docRef = doc(db, 'laporan', newId);
    await setDoc(docRef, reportData);

    const myReportIds = JSON.parse(localStorage.getItem('myReportIds') || '[]');
    myReportIds.push(newId);
    localStorage.setItem('myReportIds', JSON.stringify(myReportIds));

    resetForm();
    emit('report-submitted');
  } catch (error) {
    console.error('Error submitting report:', error);
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

    <form @submit.prevent="validateAndSubmit" novalidate>
      <div class="space-y-6">
        <div>
          <label for="nama" class="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap Pelapor</label>
          <input type="text" v-model="newLaporan.nama" id="nama" class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light" :class="{ 'border-red-500': errors.nama }" />
          <p v-if="errors.nama" class="text-red-600 text-sm mt-1">{{ errors.nama }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="telepon" class="block text-sm font-semibold text-gray-700 mb-1">Nomor Telepon/HP</label>
            <input type="tel" v-model="newLaporan.telepon" id="telepon" class="w-full px-4 py-2 border rounded-lg" :class="{ 'border-red-500': errors.telepon }" placeholder="08..." />
            <p v-if="errors.telepon" class="text-red-600 text-sm mt-1">{{ errors.telepon }}</p>
          </div>
          <div>
            <label for="tanggal" class="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kejadian</label>
            <input type="date" v-model="newLaporan.tanggal" id="tanggal" class="w-full px-4 py-2 border rounded-lg" :class="{ 'border-red-500': errors.tanggal }" />
            <p v-if="errors.tanggal" class="text-red-600 text-sm mt-1">{{ errors.tanggal }}</p>
          </div>
        </div>
        <div>
          <label for="satwa" class="block text-sm font-semibold text-gray-700 mb-1">Jenis Satwa</label>
          <select v-model="newLaporan.jenisSatwa" id="satwa" class="w-full px-4 py-2 border rounded-lg" :class="{ 'border-red-500': errors.jenisSatwa }">
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
          <label for="lokasi" class="block text-sm font-semibold text-gray-700 mb-1">Detail Lokasi (Nama Jalan/Desa/Kecamatan)</label>
          <input type="text" v-model="newLaporan.lokasi" id="lokasi" class="w-full px-4 py-2 border rounded-lg" :class="{ 'border-red-500': errors.lokasi }" placeholder="Contoh: Jl. Merdeka, Desa Rimba, Kec. Hutan" />
          <p v-if="errors.lokasi" class="text-red-600 text-sm mt-1">{{ errors.lokasi }}</p>
        </div>
        <div>
          <label for="gambar" class="block text-sm font-semibold text-gray-700 mb-1">Upload Foto & Video (Maks. 5 Foto & 1 Video)</label>
          <input
            type="file"
            @change="handleFileChange"
            id="gambar"
            ref="fileInputRef"
            multiple
            class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            :class="{ 'ring-2 ring-red-500 rounded-lg': errors.gambar }"
            accept="image/png, image/jpeg, image/jpg, video/mp4, video/quicktime, video/x-matroska"
          />
          <p v-if="errors.gambar" class="text-red-600 text-sm mt-1">{{ errors.gambar }}</p>
          
          <div v-if="previewUrls.length > 0" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div v-for="(p, index) in previewUrls" :key="p.url" class="relative">
              <img v-if="p.type === 'image'" :src="p.url" :alt="'Preview Gambar ' + (index + 1)" class="w-full h-32 object-cover rounded-lg shadow-md" />
              <video v-else-if="p.type === 'video'" :src="p.url" class="w-full h-32 object-cover rounded-lg shadow-md" controls muted playsinline></video>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Tentukan Lokasi di Peta</label>
          <MapPicker @location-selected="handleLocationUpdate" />
          <p v-if="errors.lokasiPeta" class="text-red-600 text-sm mt-1">{{ errors.lokasiPeta }}</p>
          <div class="flex space-x-4 mt-2">
            <input type="text" v-model="newLaporan.lat" class="w-1/2 px-4 py-2 border rounded-lg bg-gray-100" readonly placeholder="Latitude" />
            <input type="text" v-model="newLaporan.lng" class="w-1/2 px-4 py-2 border rounded-lg bg-gray-100" readonly placeholder="Longitude" />
          </div>
        </div>
        <div>
          <label for="deskripsi" class="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Singkat Kejadian</label>
          <textarea v-model="newLaporan.deskripsi" id="deskripsi" rows="4" class="w-full px-4 py-2 border rounded-lg" :class="{ 'border-red-500': errors.deskripsi }" placeholder="Jelaskan apa yang terjadi..."></textarea>
          <p v-if="errors.deskripsi" class="text-red-600 text-sm mt-1">{{ errors.deskripsi }}</p>
        </div>
      </div>

      <div class="mt-8 text-right">
        <button type="submit" :disabled="isSubmitting" class="bg-gradient-to-r from-brand-green to-brand-green-light text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
        </button>
      </div>
    </form>
  </div>
</template>