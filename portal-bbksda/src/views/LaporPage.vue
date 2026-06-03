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
const COOLDOWN_TICKET_KEY = 'lastReportTicketId'
const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 jam
const isRateLimited = ref(false)
const cooldownRemainingMs = ref(0)
const lastSubmittedTicketId = ref('')
let countdownInterval = null

const cooldownRemaining = computed(() => {
  const totalSec = Math.ceil(cooldownRemainingMs.value / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const visibleTicketId = computed(() => submittedTicketId.value || lastSubmittedTicketId.value)

const checkRateLimit = () => {
  const last = localStorage.getItem(COOLDOWN_KEY)
  lastSubmittedTicketId.value = localStorage.getItem(COOLDOWN_TICKET_KEY) || ''

  if (!last) return false
  const elapsed = Date.now() - parseInt(last, 10)
  if (elapsed < COOLDOWN_MS) {
    cooldownRemainingMs.value = COOLDOWN_MS - elapsed
    return true
  }

  localStorage.removeItem(COOLDOWN_KEY)
  localStorage.removeItem(COOLDOWN_TICKET_KEY)
  lastSubmittedTicketId.value = ''
  return false
}

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    cooldownRemainingMs.value -= 1000
    if (cooldownRemainingMs.value <= 0) {
      isRateLimited.value = false
      submittedTicketId.value = ''
      lastSubmittedTicketId.value = ''
      localStorage.removeItem(COOLDOWN_KEY)
      localStorage.removeItem(COOLDOWN_TICKET_KEY)
      clearInterval(countdownInterval)
    }
  }, 1000)
}
const uiStore = useUIStore()
const { uploadFiles, validateFiles } = useStorage()

// --- STATE MANAGEMENT ---
const isSubmitting = ref(false)
const submittedTicketId = ref('')
const showFullContacts = ref(false) // State untuk collapsible kontak darurat
const satwaOptions = ['Gajah Sumatera', 'Harimau Sumatera', 'Beruang Madu', 'Buaya', 'Lainnya']
const konflikOptions = [
  'Memasuki permukiman',
  'Menyerang manusia',
  'Menyerang ternak',
  'Merusak tanaman/kebun',
  'Ditemukan mati/terluka',
  'Lainnya',
]
const kabupatenKotaOptions = [
  'Kota Pekanbaru',
  'Kota Dumai',
  'Kabupaten Kampar',
  'Kabupaten Siak',
  'Kabupaten Pelalawan',
  'Kabupaten Indragiri Hulu',
  'Kabupaten Indragiri Hilir',
  'Kabupaten Kuantan Singingi',
  'Kabupaten Rokan Hulu',
  'Kabupaten Rokan Hilir',
  'Kabupaten Bengkalis',
  'Kabupaten Kepulauan Meranti'
]
const prioritasOptions = ['Rendah', 'Sedang', 'Tinggi', 'Darurat']
const prioritasHelp = {
  'Rendah': 'Satwa hanya terlihat melintas atau berada jauh dari permukiman warga.',
  'Sedang': 'Satwa masuk kebun, ladang, atau area aktivitas warga sehari-hari.',
  'Tinggi': 'Satwa berada dekat permukiman padat atau mengancam ternak/warga.',
  'Darurat': 'Terdapat korban cedera/jiwa (manusia/ternak) atau satwa masih berada di lokasi warga.'
}
const newLaporan = ref({
  nama: '',
  telepon: '',
  tanggal: new Date().toISOString().slice(0, 10),
  jenisSatwa: '',
  kategoriKonflik: '',
  kabupatenKota: '', 
  lokasi: '', 
  lat: null,
  lng: null,
  prioritas: 'Sedang', 
  deskripsi: '',
  idLaporan: '',
})
const errors = ref({})
const isCoordinateValid = ref(true) 

const selectedFiles = ref([]) 
const previewUrls = ref([]) 
const fileInputRef = ref(null)
let detachOnlineListener = null

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return

  previewUrls.value.forEach((p) => URL.revokeObjectURL(p.url))

  const validation = validateFiles(files)
  if (!validation.isValid) {
    alert(validation.error)
    fileInputRef.value.value = '' 
    return
  }

  selectedFiles.value = files
  errors.value.gambar = null

  previewUrls.value = selectedFiles.value.map((file) => ({
    url: URL.createObjectURL(file),
    type: file.type.startsWith('video/') ? 'video' : 'image',
  }))
}

onMounted(() => {
  detachOnlineListener = onOnlineProcessQueue()

  if (checkRateLimit()) {
    isRateLimited.value = true
    startCountdown()
  }
})

onUnmounted(() => {
  previewUrls.value.forEach((p) => URL.revokeObjectURL(p.url))
  if (detachOnlineListener) detachOnlineListener()
  if (countdownInterval) clearInterval(countdownInterval)
})

const handleLocationUpdate = (coords) => {
  newLaporan.value.lat = coords.lat.toFixed(6)
  newLaporan.value.lng = coords.lng.toFixed(6)
  isCoordinateValid.value = coords.isValid !== false
  
  if (errors.value.lokasiPeta) {
    errors.value.lokasiPeta = null
  }
  if (isCoordinateValid.value && errors.value.koordinatWilayah) {
    errors.value.koordinatWilayah = null
  }
}

const resetForm = () => {
  newLaporan.value = {
    nama: '',
    telepon: '',
    tanggal: new Date().toISOString().slice(0, 10),
    jenisSatwa: '',
    kategoriKonflik: '',
    kabupatenKota: '',
    lokasi: '',
    lat: null,
    lng: null,
    prioritas: 'Sedang',
    deskripsi: '',
    idLaporan: '',
  }
  selectedFiles.value = []
  previewUrls.value = []
  errors.value = {}
  isCoordinateValid.value = true
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const copyTicketId = async () => {
  if (!visibleTicketId.value) return

  try {
    await navigator.clipboard.writeText(visibleTicketId.value)
    uiStore.showNotification('success', 'ID Disalin', 'ID Tiket berhasil disalin.')
  } catch (error) {
    uiStore.showNotification('info', 'Catat ID Tiket', `ID Tiket Anda: ${visibleTicketId.value}`)
  }
}

const goToTracking = () => {
  if (visibleTicketId.value) {
    router.push({ name: 'LaporanSaya', query: { id: visibleTicketId.value } })
    return
  }
  router.push({ name: 'LaporanSaya' })
}

const validateAndSubmit = () => {
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
  if (!newLaporan.value.jenisSatwa) errors.value.jenisSatwa = 'Pilih jenis satwa.'
  if (!newLaporan.value.kategoriKonflik) errors.value.kategoriKonflik = 'Pilih kategori konflik.'
  if (!newLaporan.value.prioritas) errors.value.prioritas = 'Pilih prioritas laporan.'
  if (!newLaporan.value.kabupatenKota) errors.value.kabupatenKota = 'Pilih kabupaten/kota.'
  if (!newLaporan.value.lokasi.trim()) errors.value.lokasi = 'Detail lokasi tidak boleh kosong.'

  if (selectedFiles.value.length === 0)
    errors.value.gambar = 'Anda harus mengunggah setidaknya satu gambar atau video.'

  if (newLaporan.value.lat === null || newLaporan.value.lng === null) {
    errors.value.lokasiPeta = 'Silakan tentukan titik lokasi di peta.'
  } else if (!isCoordinateValid.value) {
    errors.value.koordinatWilayah =
      'Lokasi yang dipilih berada di luar wilayah layanan BBKSDA Riau. Silakan periksa kembali titik lokasi.'
  }

  if (Object.keys(errors.value).length === 0) {
    submitLaporan()
  }
}

const submitLaporan = async () => {
  isSubmitting.value = true

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
    const { imageUrls, videoUrl } = await uploadFiles(selectedFiles.value)

    const reportData = {
      ...newLaporan.value,
      imageUrls,
      videoUrl,
      kategoriKonflik: newLaporan.value.kategoriKonflik,
    }

    const ticketId = await reportsStore.addReport(reportData)

    submittedTicketId.value = ticketId
    lastSubmittedTicketId.value = ticketId
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString())
    localStorage.setItem(COOLDOWN_TICKET_KEY, ticketId)
    cooldownRemainingMs.value = COOLDOWN_MS
    isRateLimited.value = true
    startCountdown()

    resetForm()
    uiStore.showNotification(
      'success',
      'Laporan Terkirim!',
      `Laporan Anda berhasil dikirim. Catat ID Tiket: ${ticketId}.`,
    )
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
      class="bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-gray-200 text-center"
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

      <div
        v-if="visibleTicketId"
        class="bg-green-50 border border-green-200 rounded-xl px-5 py-5 mb-6 max-w-md mx-auto"
      >
        <p class="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">ID Tiket Laporan Terakhir</p>
        <p class="text-2xl sm:text-3xl font-mono font-extrabold text-brand-green break-all">
          {{ visibleTicketId }}
        </p>
        <p class="text-xs text-green-700 mt-2">
          Simpan ID ini untuk memantau status laporan di halaman Laporan Saya.
        </p>
      </div>
      <p v-else class="text-xs text-gray-500 mb-6 max-w-md mx-auto">
        Jika Anda lupa ID Tiket, hubungi WhatsApp 0813-7474-2981 dengan format:
        LUPA ID - NAMA - NOMOR HP - TANGGAL LAPORAN - LOKASI.
      </p>

      <!-- Countdown Timer -->
      <div class="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-8 py-5 mb-8">
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
          @click="goToTracking"
          class="bg-brand-green text-white font-semibold py-3 px-6 rounded-md hover:bg-brand-green-light transition-colors"
        >
          Lihat Laporan Saya
        </button>
        <button
          v-if="visibleTicketId"
          @click="copyTicketId"
          class="bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition-colors"
        >
          Salin ID Tiket
        </button>
        <button
          @click="router.push({ name: 'Home' })"
          class="bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>

    <!-- ===== SUCCESS STATE ===== -->
    <div
      v-else-if="submittedTicketId"
      class="bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-green-200 text-center"
    >
      <div class="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Laporan Berhasil Dikirim</h2>
      <p class="text-gray-500 max-w-xl mx-auto mb-6">
        Catat atau simpan ID Tiket berikut untuk mengecek status laporan Anda di halaman Laporan Saya.
      </p>

      <div class="bg-green-50 border border-green-200 rounded-xl px-5 py-6 mb-6 max-w-md mx-auto">
        <p class="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">ID Tiket Laporan</p>
        <p class="text-2xl sm:text-3xl font-mono font-extrabold text-brand-green break-all">
          {{ submittedTicketId }}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="goToTracking"
          class="bg-brand-green text-white font-semibold py-3 px-6 rounded-md hover:bg-brand-green-light transition-colors"
        >
          Pantau Status Laporan
        </button>
        <button
          @click="copyTicketId"
          class="bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-md hover:bg-gray-200 transition-colors"
        >
          Salin ID Tiket
        </button>
      </div>
    </div>

    <!-- ===== FORM LAPORAN ===== -->
    <div v-else>
      <!-- COMPACT COLLAPSIBLE EMERGENCY CONTACTS -->
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 text-red-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-sm font-bold">Kondisi darurat? Hubungi petugas: <a href="tel:076163135" class="hover:underline text-red-900 font-extrabold">0761-63135</a> / WhatsApp <a href="https://wa.me/6281374742981" target="_blank" class="hover:underline text-red-900 font-extrabold">0813-7474-2981</a></span>
          </div>
          <button 
            type="button"
            @click="showFullContacts = !showFullContacts"
            class="text-xs font-bold text-red-700 bg-red-100/80 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 self-start sm:self-auto"
          >
            <span>{{ showFullContacts ? 'Tutup kontak' : 'Lihat kontak lengkap' }}</span>
            <svg class="h-3.5 w-3.5 transition-transform duration-200" :class="{ 'rotate-180': showFullContacts }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
        
        <!-- Collapsible Details -->
        <div v-show="showFullContacts" class="mt-4 pt-4 border-t border-red-200/50 animate-in">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-800">
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <strong>Telepon Layanan:</strong> 0761-63135
            </div>
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <strong>WhatsApp Petugas:</strong> 0813-7474-2981
            </div>
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <strong>Email Pengaduan:</strong> humas@bbksda-riau.com
            </div>
            <div class="flex items-start gap-2 md:col-span-2">
              <svg class="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span><strong>Kantor BBKSDA Riau:</strong> Jl. H.R. Soebrantas Km. 8.5, Sidomulyo Barat-Arengka, Pekanbaru (Senin-Jumat, 08.00-16.00 WIB).</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-5 sm:p-8 md:p-10 rounded-lg border border-gray-200 shadow-sm">
        <h2 class="text-2xl sm:text-3xl font-bold mb-2 text-center text-brand-green">Formulir Laporan Konflik Satwa</h2>
        <p class="text-center text-gray-500 mb-8 text-sm sm:text-base">Isi data di bawah ini selengkap mungkin agar petugas dapat memahami dan merespons kejadian secara tepat.</p>

        <form @submit.prevent="validateAndSubmit" novalidate>
          <div class="space-y-8">
            
            <!-- KELOMPOK VISUAL 1: DATA PELAPOR -->
            <div class="border-b border-gray-100 pb-6">
              <div class="flex items-center gap-2.5 mb-5">
                <div class="h-5 w-1 bg-brand-green rounded-full"></div>
                <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">1. Identitas Pelapor</h3>
              </div>
              
              <div class="space-y-5">
                <div>
                  <label for="nama" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Nama Lengkap Pelapor</label
                  >
                  <input
                    type="text"
                    v-model="newLaporan.nama"
                    id="nama"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light transition-all outline-none"
                    :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.nama }"
                    placeholder="Tuliskan nama lengkap Anda"
                  />
                  <p v-if="errors.nama" class="text-red-600 text-xs font-semibold mt-1">{{ errors.nama }}</p>
                </div>
                
                <div>
                  <label for="telepon" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Nomor Telepon/WhatsApp Aktif</label
                  >
                  <input
                    type="tel"
                    v-model="newLaporan.telepon"
                    id="telepon"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light transition-all outline-none"
                    :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.telepon }"
                    placeholder="Contoh: 081234567890"
                  />
                  <p v-if="errors.telepon" class="text-red-600 text-xs font-semibold mt-1">{{ errors.telepon }}</p>
                </div>
              </div>
            </div>

            <!-- KELOMPOK VISUAL 2: INFORMASI KEJADIAN -->
            <div class="border-b border-gray-100 pb-6">
              <div class="flex items-center gap-2.5 mb-5">
                <div class="h-5 w-1 bg-brand-green rounded-full"></div>
                <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">2. Informasi Kejadian Konflik</h3>
              </div>

              <div class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label for="tanggal" class="block text-sm font-semibold text-gray-700 mb-1"
                      >Tanggal Kejadian</label
                    >
                    <input
                      type="date"
                      v-model="newLaporan.tanggal"
                      id="tanggal"
                      class="date-input-ios w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light transition-all outline-none"
                      :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.tanggal }"
                    />
                    <p v-if="errors.tanggal" class="text-red-600 text-xs font-semibold mt-1">{{ errors.tanggal }}</p>
                  </div>
                  
                  <div>
                    <label for="satwa" class="block text-sm font-semibold text-gray-700 mb-1"
                      >Jenis Satwa</label
                    >
                    <select
                      v-model="newLaporan.jenisSatwa"
                      id="satwa"
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light bg-white transition-all outline-none"
                      :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.jenisSatwa }"
                    >
                      <option disabled value="">Pilih jenis satwa</option>
                      <option v-for="opsi in satwaOptions" :key="opsi" :value="opsi">{{ opsi }}</option>
                    </select>
                    <p v-if="errors.jenisSatwa" class="text-red-600 text-xs font-semibold mt-1">{{ errors.jenisSatwa }}</p>
                  </div>
                </div>

                <div>
                  <label for="kategori-konflik" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Kategori Konflik</label
                  >
                  <select
                    v-model="newLaporan.kategoriKonflik"
                    id="kategori-konflik"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light bg-white transition-all outline-none"
                    :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.kategoriKonflik }"
                  >
                    <option disabled value="">Pilih kategori konflik</option>
                    <option v-for="opsi in konflikOptions" :key="`kategori-${opsi}`" :value="opsi">
                      {{ opsi }}
                    </option>
                  </select>
                  <p v-if="errors.kategoriKonflik" class="text-red-600 text-xs font-semibold mt-1">
                    {{ errors.kategoriKonflik }}
                  </p>
                </div>

                <div>
                  <label for="prioritas" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Seberapa mendesak kondisi kejadian?</label
                  >
                  <select
                    v-model="newLaporan.prioritas"
                    id="prioritas"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light bg-white transition-all outline-none"
                    :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.prioritas }"
                  >
                    <option disabled value="">Tingkat kemendesakan kondisi</option>
                    <option value="Rendah">Rendah (Satwa hanya terlihat melintas)</option>
                    <option value="Sedang">Sedang (Satwa masuk kebun atau area aktivitas warga)</option>
                    <option value="Tinggi">Tinggi (Satwa dekat permukiman atau ternak)</option>
                    <option value="Darurat">Darurat (Ada korban atau satwa masih berada di lokasi warga)</option>
                  </select>
                  <p class="text-brand-green font-medium text-[11px] mt-1.5 bg-green-50 border border-green-100 p-2 rounded-md leading-relaxed">
                    <strong>Keterangan:</strong> {{ prioritasHelp[newLaporan.prioritas] || '' }}
                  </p>
                  <p v-if="errors.prioritas" class="text-red-600 text-xs font-semibold mt-1">
                    {{ errors.prioritas }}
                  </p>
                </div>
              </div>
            </div>

            <!-- KELOMPOK VISUAL 3: LOKASI KEJADIAN -->
            <div class="border-b border-gray-100 pb-6">
              <div class="flex items-center gap-2.5 mb-5">
                <div class="h-5 w-1 bg-brand-green rounded-full"></div>
                <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">3. Lokasi Konflik</h3>
              </div>

              <div class="space-y-5">
                <div>
                  <label for="kabupatenKota" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Kabupaten / Kota</label
                  >
                  <select
                    v-model="newLaporan.kabupatenKota"
                    id="kabupatenKota"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light bg-white transition-all outline-none"
                    :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.kabupatenKota }"
                  >
                    <option disabled value="">Pilih Kabupaten/Kota di wilayah Riau</option>
                    <option v-for="opsi in kabupatenKotaOptions" :key="`kab-${opsi}`" :value="opsi">
                      {{ opsi }}
                    </option>
                  </select>
                  <p v-if="errors.kabupatenKota" class="text-red-600 text-xs font-semibold mt-1">{{ errors.kabupatenKota }}</p>
                </div>

                <div>
                  <label for="lokasi" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Detail Alamat / Lokasi Kejadian</label
                  >
                  <input
                    type="text"
                    v-model="newLaporan.lokasi"
                    id="lokasi"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light transition-all outline-none"
                    :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.lokasi }"
                    placeholder="Contoh: Jl. Merdeka RT 02/RW 03, sebelah Mushola Al-Ikhlas"
                  />
                  <p class="text-gray-400 text-xs mt-1.5">Gunakan nama jalan, desa, kecamatan, atau patokan terdekat untuk mempermudah petugas.</p>
                  <p v-if="errors.lokasi" class="text-red-600 text-xs font-semibold mt-1">{{ errors.lokasi }}</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1"
                    >Tandai Titik Koordinat di Peta</label
                  >
                  <p class="text-gray-400 text-xs mb-3">Geser pin ke titik lokasi kejadian konflik. Pastikan titik berada di area kerja Provinsi Riau.</p>
                  
                  <div class="border border-gray-200 rounded-xl overflow-hidden shadow-inner">
                    <MapPicker @location-selected="handleLocationUpdate" />
                  </div>
                  
                  <p v-if="errors.lokasiPeta" class="text-red-600 text-xs font-semibold mt-1">{{ errors.lokasiPeta }}</p>
                  <p v-if="errors.koordinatWilayah" class="text-red-600 text-xs font-semibold mt-1">{{ errors.koordinatWilayah }}</p>

                  <div class="flex flex-col sm:flex-row gap-3 mt-3">
                    <div class="w-full sm:w-1/2">
                      <label class="block text-xs font-bold text-gray-500 mb-1">Latitude</label>
                      <input
                        type="text"
                        v-model="newLaporan.lat"
                        class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm font-mono font-semibold"
                        readonly
                        placeholder="Belum terdeteksi"
                      />
                    </div>
                    <div class="w-full sm:w-1/2">
                      <label class="block text-xs font-bold text-gray-500 mb-1">Longitude</label>
                      <input
                        type="text"
                        v-model="newLaporan.lng"
                        class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm font-mono font-semibold"
                        readonly
                        placeholder="Belum terdeteksi"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- KELOMPOK VISUAL 4: BUKTI & KRONOLOGI -->
            <div>
              <div class="flex items-center gap-2.5 mb-5">
                <div class="h-5 w-1 bg-brand-green rounded-full"></div>
                <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">4. Bukti Foto/Video & Deskripsi</h3>
              </div>

              <div class="space-y-5">
                <div>
                  <label for="gambar" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Dokumentasi Bukti Lapangan</label
                  >
                  <p class="text-gray-400 text-xs mb-3">Unggah foto atau video jika tersedia. Jangan mengambil dokumentasi jika kondisi membahayakan keselamatan Anda.</p>
                  <input
                    type="file"
                    @change="handleFileChange"
                    id="gambar"
                    ref="fileInputRef"
                    multiple
                    class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors cursor-pointer"
                    :class="{ 'ring-2 ring-red-500 rounded-lg': errors.gambar }"
                    accept="image/png, image/jpeg, image/jpg, video/mp4, video/quicktime, video/x-matroska"
                  />
                  <p v-if="errors.gambar" class="text-red-600 text-xs font-semibold mt-1">{{ errors.gambar }}</p>

                  <div
                    v-if="previewUrls.length > 0"
                    class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  >
                    <div v-for="(p, index) in previewUrls" :key="p.url" class="relative group rounded-lg overflow-hidden border border-gray-200">
                      <img
                        v-if="p.type === 'image'"
                        :src="p.url"
                        :alt="'Preview Gambar ' + (index + 1)"
                        class="w-full h-24 object-cover"
                      />
                      <video
                        v-else-if="p.type === 'video'"
                        :src="p.url"
                        class="w-full h-24 object-cover bg-black"
                        controls
                        muted
                        playsinline
                      ></video>
                      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                        <span class="text-[10px] font-bold text-white uppercase">{{ p.type }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label for="deskripsi" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Kronologi & Deskripsi Kejadian</label
                  >
                  <p class="text-gray-400 text-xs mb-3">Tuliskan kronologi, seperti taksiran ukuran satwa, perilaku agresif, riwayat kerusakan, atau adanya korban.</p>
                  <textarea
                    v-model="newLaporan.deskripsi"
                    id="deskripsi"
                    rows="4"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-light focus:border-brand-green-light transition-all outline-none text-sm"
                    :class="{ 'border-red-500 focus:ring-red-200 focus:border-red-500': errors.deskripsi }"
                    placeholder="Contoh: Terlihat 1 ekor gajah sumatera jantan melintas di dekat ladang sawit warga pukul 15.00 WIB. Satwa merusak beberapa pagar pembatas kebun dan bergerak lambat ke arah selatan hutan penyangga."
                  ></textarea>
                  <p v-if="errors.deskripsi" class="text-red-600 text-xs font-semibold mt-1">{{ errors.deskripsi }}</p>
                </div>
              </div>
            </div>

          </div>

          <!-- SUBMIT ACTIONS -->
          <div class="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center sm:items-end gap-3 text-center sm:text-right">
            <span class="text-xs text-gray-500 italic bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
              Pastikan data yang dikirim sudah sesuai sebelum melanjutkan.
            </span>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full sm:w-auto bg-brand-green text-white font-bold py-3.5 px-10 rounded-md hover:bg-brand-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase"
            >
              {{ isSubmitting ? 'Sedang Mengirim...' : 'Kirim Laporan Resmi' }}
            </button>
          </div>
        </form>
        <p class="mt-4 text-center text-xs leading-relaxed text-gray-500">
          Jika koneksi internet Anda tidak stabil, Anda dapat melaporkan kejadian via WhatsApp teks ke 0813-7474-2981 dengan format: NAMA - LOKASI - JENIS SATWA - KONDISI.
        </p>
      </div>
    </div>
  </div>
</template>
