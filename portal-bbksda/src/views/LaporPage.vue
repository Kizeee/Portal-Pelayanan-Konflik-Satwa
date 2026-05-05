<script setup>
import { onMounted, ref, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsStore } from '../stores/reports'
import { useUIStore } from '../stores/ui'
import { useStorage } from '../composables/useStorage'
import MapPicker from '../components/MapPicker.vue'
import {
  onOnlineProcessQueue,
  saveReportOffline,
  triggerBackgroundSync,
} from '../utils/offlineQueue'

const router = useRouter()
const reportsStore = useReportsStore()

// --- RATE LIMITING ---
const COOLDOWN_KEY = 'lastReportSubmitTime'
const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 jam
const isRateLimited = ref(false)
const cooldownRemainingMs = ref(0)
let countdownInterval = null

const cooldownRemaining = computed(() => {
  const totalSec = Math.ceil(cooldownRemainingMs.value / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const checkRateLimit = () => {
  const last = localStorage.getItem(COOLDOWN_KEY)
  if (!last) return false
  const elapsed = Date.now() - parseInt(last, 10)
  if (elapsed < COOLDOWN_MS) {
    cooldownRemainingMs.value = COOLDOWN_MS - elapsed
    return true
  }
  return false
}

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    cooldownRemainingMs.value -= 1000
    if (cooldownRemainingMs.value <= 0) {
      isRateLimited.value = false
      clearInterval(countdownInterval)
    }
  }, 1000)
}
const uiStore = useUIStore()
const { uploadFiles, validateFiles } = useStorage()

// --- STATE MANAGEMENT ---
const isSubmitting = ref(false)
const satwaOptions = ['Gajah Sumatera', 'Harimau Sumatera', 'Beruang Madu', 'Buaya', 'Lainnya']
const konflikOptions = [
  'Memasuki permukiman',
  'Menyerang manusia',
  'Menyerang ternak',
  'Merusak tanaman/kebun',
  'Ditemukan mati/terluka',
  'Lainnya',
]
const newLaporan = ref({
  nama: '',
  telepon: '',
  tanggal: new Date().toISOString().slice(0, 10),
  jenisSatwa: '',
  kategoriKonflik: '',
  lokasi: '', // Field ini yang akan diisi oleh input baru
  lat: null,
  lng: null,
  deskripsi: '',
  idLaporan: '',
})
const errors = ref({})

// --- PERUBAHAN #1: State untuk menampung gambar DAN video ---
const selectedFiles = ref([]) // Menampung semua file (gambar dan video)
const previewUrls = ref([]) // Menampung URL preview beserta tipenya
const fileInputRef = ref(null)
let detachOnlineListener = null

// Functions moved to useReports composable and reportsStore

// --- PERUBAHAN #2: Fungsi untuk menangani input gambar dan video ---
const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return

  // Hapus URL preview lama untuk mencegah memory leak
  previewUrls.value.forEach((p) => URL.revokeObjectURL(p.url))

  // Validate files using composable
  const validation = validateFiles(files)
  if (!validation.isValid) {
    alert(validation.error)
    fileInputRef.value.value = '' // Reset input
    return
  }

  selectedFiles.value = files
  errors.value.gambar = null

  // Buat URL preview baru, simpan juga tipenya (image/video)
  previewUrls.value = selectedFiles.value.map((file) => ({
    url: URL.createObjectURL(file),
    type: file.type.startsWith('video/') ? 'video' : 'image',
  }))
}

onMounted(() => {
  // Pastikan antrean offline otomatis diproses ketika koneksi kembali
  detachOnlineListener = onOnlineProcessQueue()

  // Cek rate limit saat komponen dimuat
  if (checkRateLimit()) {
    isRateLimited.value = true
    startCountdown()
  }
})

// Pastikan semua URL preview dibersihkan saat komponen ditutup
onUnmounted(() => {
  previewUrls.value.forEach((p) => URL.revokeObjectURL(p.url))
  if (detachOnlineListener) detachOnlineListener()
  if (countdownInterval) clearInterval(countdownInterval)
})

const handleLocationUpdate = (coords) => {
  newLaporan.value.lat = coords.lat.toFixed(6)
  newLaporan.value.lng = coords.lng.toFixed(6)
  // Hapus error lokasi peta jika ada, karena peta sudah dipilih
  if (errors.value.lokasiPeta) {
    errors.value.lokasiPeta = null
  }
}

const resetForm = () => {
  newLaporan.value = {
    nama: '',
    telepon: '',
    tanggal: new Date().toISOString().slice(0, 10),
    jenisSatwa: '',
    kategoriKonflik: '',
    lokasi: '',
    lat: null,
    lng: null,
    deskripsi: '',
    idLaporan: '',
  }
  selectedFiles.value = []
  previewUrls.value = []
  errors.value = {}
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const validateAndSubmit = () => {
  // Cek rate limit sebelum validasi form
  if (checkRateLimit()) {
    isRateLimited.value = true
    startCountdown()
    return
  }

  errors.value = {}
  if (!newLaporan.value.nama.trim()) errors.value.nama = 'Nama tidak boleh kosong.'
  if (!newLaporan.value.telepon.trim()) errors.value.telepon = 'Telepon tidak boleh kosong.'
  else if (!/^08[0-9]{8,12}$/.test(newLaporan.value.telepon))
    errors.value.telepon = 'Format nomor telepon tidak valid (contoh: 081234567890).'
  if (!newLaporan.value.jenisSatwa) errors.value.jenisSatwa = 'Jenis satwa harus dipilih.'
  if (!newLaporan.value.kategoriKonflik)
    errors.value.kategoriKonflik = 'Kategori konflik harus dipilih.'

  // Validasi field lokasi yang baru ditambahkan
  if (!newLaporan.value.lokasi.trim()) errors.value.lokasi = 'Detail lokasi tidak boleh kosong.'

  if (selectedFiles.value.length === 0)
    errors.value.gambar = 'Anda harus mengunggah setidaknya satu gambar atau video.'

  // Validasi tambahan untuk memastikan peta sudah dipilih
  if (newLaporan.value.lat === null || newLaporan.value.lng === null) {
    errors.value.lokasiPeta = 'Silakan tentukan titik lokasi di peta.'
  }

  if (Object.keys(errors.value).length === 0) {
    submitLaporan()
  }
}

// --- PERUBAHAN #3: Fungsi submit untuk mengunggah gambar DAN video ---
const submitLaporan = async () => {
  isSubmitting.value = true

  // Jika offline, simpan ke IndexedDB lalu daftarkan background sync
  if (!navigator.onLine) {
    try {
      const offlinePayload = {
        ...newLaporan.value,
        status: 'Menunggu Verifikasi',
        queuedAt: new Date().toISOString(),
      }

      await saveReportOffline(offlinePayload, selectedFiles.value)
      await triggerBackgroundSync()

      resetForm()
      uiStore.showNotification(
        'info',
        'Tersimpan Offline',
        'Koneksi tidak tersedia. Data laporan disimpan dan akan dikirim otomatis saat online.',
      )
    } catch (error) {
      console.error('Error saving offline report:', error)
      uiStore.showNotification(
        'error',
        'Gagal Menyimpan',
        'Laporan tidak tersimpan. Silakan coba lagi.',
      )
    } finally {
      isSubmitting.value = false
    }
    return
  }

  try {
    // Upload files using composable
    const { imageUrls, videoUrl } = await uploadFiles(selectedFiles.value)

    // Prepare report data
    const reportData = {
      ...newLaporan.value,
      imageUrls,
      videoUrl,
      kategoriKonflik: newLaporan.value.kategoriKonflik,
    }

    // Create report using store
    await reportsStore.addReport(reportData)

    // Simpan timestamp pengiriman untuk rate limiting
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString())

    resetForm()
    uiStore.showNotification(
      'success',
      'Laporan Terkirim!',
      'Terima kasih. Laporan Anda telah berhasil kami terima dan sedang menunggu verifikasi.',
    )

    // Navigate to my reports after brief delay
    setTimeout(() => {
      uiStore.hideNotification()
      router.push({ name: 'LaporanSaya' })
    }, 2000)
  } catch (error) {
    console.error('Error submitting report:', error)
    uiStore.showNotification(
      'error',
      'Gagal Mengirim',
      'Gagal mengirim laporan. Silakan coba lagi.',
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- ===== RATE LIMIT BLOCKER ===== -->
    <div
      v-if="isRateLimited"
      class="bg-white p-8 sm:p-12 rounded-2xl shadow-lg text-center"
    >
      <!-- Icon -->
      <div class="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-2">Laporan Sudah Terkirim</h2>
      <p class="text-gray-500 mb-6 max-w-md mx-auto">
        Anda baru saja mengirimkan laporan. Demi menjaga kualitas data, setiap perangkat
        hanya dapat mengirim <strong>1 laporan per 24 jam</strong>.
      </p>

      <!-- Countdown Timer -->
      <div class="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-8 py-5 mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-left">
          <p class="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Dapat mengirim lagi dalam</p>
          <p class="text-3xl font-mono font-bold text-amber-700 tracking-widest">{{ cooldownRemaining }}</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="router.push({ name: 'LaporanSaya' })"
          class="bg-brand-green text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition"
        >
          Lihat Laporan Saya
        </button>
        <button
          @click="router.push({ name: 'Home' })"
          class="bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>

    <!-- ===== FORM LAPORAN (normal) ===== -->
    <div v-else class="bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-lg">
    <h2 class="text-2xl sm:text-3xl font-bold mb-2 text-center text-brand-green">Formulir Pengaduan Konflik</h2>
    <p class="text-center text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">Isi formulir di bawah ini dengan data yang akurat.</p>

    <form @submit.prevent="validateAndSubmit" novalidate>
      <div class="space-y-6">
        <div>
          <label for="nama" class="block text-sm font-semibold text-gray-700 mb-1"
            >Nama Lengkap Pelapor</label
          >
          <input
            type="text"
            v-model="newLaporan.nama"
            id="nama"
            class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light"
            :class="{ 'border-red-500': errors.nama }"
          />
          <p v-if="errors.nama" class="text-red-600 text-sm mt-1">{{ errors.nama }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="telepon" class="block text-sm font-semibold text-gray-700 mb-1"
              >Nomor Telepon/HP</label
            >
            <input
              type="tel"
              v-model="newLaporan.telepon"
              id="telepon"
              class="w-full px-4 py-2 border rounded-lg"
              :class="{ 'border-red-500': errors.telepon }"
              placeholder="08..."
            />
            <p v-if="errors.telepon" class="text-red-600 text-sm mt-1">{{ errors.telepon }}</p>
          </div>
          <div class="min-w-0">
            <label for="tanggal" class="block text-sm font-semibold text-gray-700 mb-1"
              >Tanggal Kejadian</label
            >
            <input
              type="date"
              v-model="newLaporan.tanggal"
              id="tanggal"
              class="w-full max-w-full px-4 py-2 border rounded-lg box-border"
              :class="{ 'border-red-500': errors.tanggal }"
            />
            <p v-if="errors.tanggal" class="text-red-600 text-sm mt-1">{{ errors.tanggal }}</p>
          </div>
        </div>
        <div>
          <label for="satwa" class="block text-sm font-semibold text-gray-700 mb-1"
            >Jenis Satwa</label
          >
          <select
            v-model="newLaporan.jenisSatwa"
            id="satwa"
            class="w-full px-4 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.jenisSatwa }"
          >
            <option disabled value="">Pilih jenis satwa</option>
            <option v-for="opsi in satwaOptions" :key="opsi" :value="opsi">{{ opsi }}</option>
          </select>
          <p v-if="errors.jenisSatwa" class="text-red-600 text-sm mt-1">{{ errors.jenisSatwa }}</p>
        </div>
        <div>
          <label for="kategori-konflik" class="block text-sm font-semibold text-gray-700 mb-1"
            >Kategori Konflik</label
          >
          <select
            v-model="newLaporan.kategoriKonflik"
            id="kategori-konflik"
            class="w-full px-4 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.kategoriKonflik }"
          >
            <option disabled value="">Pilih kategori konflik</option>
            <option v-for="opsi in konflikOptions" :key="`kategori-${opsi}`" :value="opsi">
              {{ opsi }}
            </option>
          </select>
          <p v-if="errors.kategoriKonflik" class="text-red-600 text-sm mt-1">
            {{ errors.kategoriKonflik }}
          </p>
        </div>

        <div>
          <label for="lokasi" class="block text-sm font-semibold text-gray-700 mb-1"
            >Detail Lokasi (Nama Jalan/Desa/Kecamatan)</label
          >
          <input
            type="text"
            v-model="newLaporan.lokasi"
            id="lokasi"
            class="w-full px-4 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.lokasi }"
            placeholder="Contoh: Jl. Merdeka, Desa Rimba, Kec. Hutan"
          />
          <p v-if="errors.lokasi" class="text-red-600 text-sm mt-1">{{ errors.lokasi }}</p>
        </div>
        <div>
          <label for="gambar" class="block text-sm font-semibold text-gray-700 mb-1"
            >Upload Foto & Video (Maks. 5 Foto & 1 Video)</label
          >
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

          <div
            v-if="previewUrls.length > 0"
            class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            <div v-for="(p, index) in previewUrls" :key="p.url" class="relative">
              <img
                v-if="p.type === 'image'"
                :src="p.url"
                :alt="'Preview Gambar ' + (index + 1)"
                class="w-full h-32 object-cover rounded-lg shadow-md"
              />
              <video
                v-else-if="p.type === 'video'"
                :src="p.url"
                class="w-full h-32 object-cover rounded-lg shadow-md"
                controls
                muted
                playsinline
              ></video>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1"
            >Tentukan Lokasi di Peta</label
          >
          <MapPicker @location-selected="handleLocationUpdate" />
          <p v-if="errors.lokasiPeta" class="text-red-600 text-sm mt-1">{{ errors.lokasiPeta }}</p>
          <div class="flex flex-col sm:flex-row gap-3 mt-2">
            <input
              type="text"
              v-model="newLaporan.lat"
              class="w-full sm:w-1/2 px-4 py-2 border rounded-lg bg-gray-100"
              readonly
              placeholder="Latitude"
            />
            <input
              type="text"
              v-model="newLaporan.lng"
              class="w-full sm:w-1/2 px-4 py-2 border rounded-lg bg-gray-100"
              readonly
              placeholder="Longitude"
            />
          </div>
        </div>
        <div>
          <label for="deskripsi" class="block text-sm font-semibold text-gray-700 mb-1"
            >Deskripsi Singkat Kejadian</label
          >
          <textarea
            v-model="newLaporan.deskripsi"
            id="deskripsi"
            rows="4"
            class="w-full px-4 py-2 border rounded-lg"
            :class="{ 'border-red-500': errors.deskripsi }"
            placeholder="Jelaskan apa yang terjadi..."
          ></textarea>
          <p v-if="errors.deskripsi" class="text-red-600 text-sm mt-1">{{ errors.deskripsi }}</p>
        </div>
      </div>

      <div class="mt-6 sm:mt-8 flex justify-center sm:justify-end">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full sm:w-auto bg-gradient-to-r from-brand-green to-brand-green-light text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
        </button>
      </div>
    </form>
    </div><!-- end v-else form -->
  </div>
</template>
