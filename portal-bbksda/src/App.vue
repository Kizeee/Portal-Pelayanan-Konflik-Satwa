<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, doc, getDoc, updateDoc } from 'firebase/firestore'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import NotificationModal from './components/NotificationModal.vue'
import Chatbot from './components/Chatbot.vue'

import HomePage from './views/HomePage.vue'
import PetaPage from './views/PetaPage.vue'
import LaporPage from './views/LaporPage.vue'
import LihatLaporanPage from './views/LihatLaporanPage.vue'
import DetailPage from './views/DetailPage.vue'
import LoginPage from './views/LoginPage.vue'
import DashboardPage from './views/DashboardPage.vue'
import LaporanSayaPage from './views/LaporanSayaPage.vue'
import EditLaporanForm from './components/EditLaporanForm.vue'

const currentPage = ref('home')
const isLoading = ref(true)
const user = ref(null)
const laporanList = ref([])
const selectedReportId = ref(null)
const myReportIds = ref([]) 
const isChatbotOpen = ref(false)

const showNotification = ref(false)
const notification = ref({ type: '', title: '', message: '' })

const showEditModal = ref(false)
const laporanUntukDiedit = ref(null)

const reportsWithCoords = computed(() => {
  return laporanList.value.filter((laporan) => laporan.lat && laporan.lng)
})

const selectedReport = computed(() => {
  if (!selectedReportId.value) return null
  return laporanList.value.find((r) => r.id === selectedReportId.value) || null
})

const myReports = computed(() => {
  return laporanList.value.filter((report) => myReportIds.value.includes(report.id))
})

const navigate = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
}

const fetchLaporan = async () => {
  isLoading.value = true
  try {
    const q = query(collection(db, 'laporan'))
    const querySnapshot = await getDocs(q)
    const reports = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    laporanList.value = reports.sort(
      (a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0),
    )
  } catch (error) {
    console.error('Error fetching reports: ', error)
    showNotificationModal('error', 'Gagal Memuat Data', 'Tidak dapat mengambil data dari server.')
  } finally {
    isLoading.value = false
  }
}

const showNotificationModal = (type, title, message) => {
  notification.value = { type, title, message }
  showNotification.value = true
}

const handleViewDetail = (reportId) => {
  selectedReportId.value = reportId
  navigate('detail')
}

const handleReportSubmitted = () => {
  showNotificationModal(
    'success',
    'Laporan Terkirim!',
    'Terima kasih. Laporan Anda telah berhasil kami terima.',
  )
  myReportIds.value = JSON.parse(localStorage.getItem('myReportIds') || '[]')
  fetchLaporan()
}

const handleReportUpdated = () => {
  showNotificationModal('success', 'Status Diperbarui', 'Status laporan telah berhasil diubah.')
  fetchLaporan()
}

const handleLoginSuccess = () => {
  navigate('dashboard')
}

const handleCloseNotification = () => {
  showNotification.value = false
  if (notification.value.type === 'success') {
    if (currentPage.value !== 'laporan-saya') {
      navigate('laporan-saya')
    }
  }
}

const handleEditReport = async (laporanId) => {
  try {
    const reportRef = doc(db, 'laporan', laporanId)
    const reportSnap = await getDoc(reportRef)
    if (reportSnap.exists()) {
      laporanUntukDiedit.value = { id: reportSnap.id, ...reportSnap.data() }
      showEditModal.value = true
    } else {
      console.error('Laporan tidak ditemukan untuk diedit.')
      showNotificationModal('error', 'Gagal', 'Laporan yang ingin Anda edit tidak ditemukan.')
    }
  } catch (error) {
    console.error('Error mengambil data laporan untuk diedit:', error)
    showNotificationModal('error', 'Error', 'Gagal mengambil data laporan.')
  }
}

const handleSaveChanges = async (updatedData) => {
  if (!laporanUntukDiedit.value) return
  const reportRef = doc(db, 'laporan', laporanUntukDiedit.value.id)
  try {
    await updateDoc(reportRef, updatedData)
    await fetchLaporan()
    showEditModal.value = false
    showNotificationModal('success', 'Berhasil', 'Laporan berhasil diperbarui.')
  } catch (error) {
    console.error('Gagal memperbarui laporan:', error)
    showNotificationModal('error', 'Gagal', 'Terjadi kesalahan saat menyimpan perubahan.')
  }
}

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
  })
  myReportIds.value = JSON.parse(localStorage.getItem('myReportIds') || '[]')
  fetchLaporan()
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-brand-bg font-sans">
    <Header
      :current-page="currentPage"
      :user="user"
      :has-my-reports="myReportIds.length > 0"
      @navigate="navigate"
      @open-chatbot="isChatbotOpen = true"
    />

    <main class="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div v-if="isLoading" class="text-center p-10">
        <p>Memuat data...</p>
      </div>
      <template v-else>
        <HomePage v-if="currentPage === 'home'" @navigate="navigate" />
        <DashboardPage v-if="currentPage === 'dashboard'" :reports="laporanList" />
        <PetaPage v-if="currentPage === 'peta'" :reports="reportsWithCoords" />
        <LaporPage v-if="currentPage === 'lapor'" @report-submitted="handleReportSubmitted" />
        <LihatLaporanPage
          v-if="currentPage === 'lihat'"
          :reports="laporanList"
          @view-detail="handleViewDetail"
        />
        <LaporanSayaPage
          v-if="currentPage === 'laporan-saya'"
          :my-reports="myReports"
          @view-detail="handleViewDetail"
          @navigate="navigate"
          @edit-report="handleEditReport"
        />
        <DetailPage
          v-if="currentPage === 'detail'"
          :report="selectedReport"
          :user="user"
          @navigate-back="navigate('lihat')"
          @report-updated="handleReportUpdated"
        />
        <LoginPage v-if="currentPage === 'login'" @login-success="handleLoginSuccess" />
      </template>
    </main>

    <Footer />

    <NotificationModal
      :show="showNotification"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="handleCloseNotification"
    />

    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <EditLaporanForm
          :laporanToEdit="laporanUntukDiedit"
          @close-modal="showEditModal = false"
          @save-changes="handleSaveChanges"
        />
      </div>
    </div>
    
    <button @click="isChatbotOpen = !isChatbotOpen" class="fixed bottom-5 right-5 h-16 w-16 bg-brand-green rounded-full shadow-lg text-white flex items-center justify-center z-[2001] hover:scale-110 transition-transform">
      <svg v-if="!isChatbotOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <Chatbot :show="isChatbotOpen" @close="isChatbotOpen = false" />
  </div>
</template>