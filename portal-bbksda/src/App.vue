<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useReportsStore } from './stores/reports'
import { useUIStore } from './stores/ui'
import { useNotificationsStore } from './stores/notifications'
import { useReporterNotificationsStore } from './stores/reporterNotifications'
import { useReports } from './composables/useReports'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import NotificationModal from './components/NotificationModal.vue'
import ToastNotification from './components/ToastNotification.vue'
import ReporterToastNotification from './components/ReporterToastNotification.vue'

import EditLaporanForm from './components/EditLaporanForm.vue'
import ReloadPrompt from './components/ReloadPrompt.vue'

// Stores
const authStore = useAuthStore()
const reportsStore = useReportsStore()
const uiStore = useUIStore()
const notifStore = useNotificationsStore()
const reporterNotifStore = useReporterNotificationsStore()

// Composables
const { updateReport } = useReports()

// Initialize stores on mount
onMounted(async () => {
  authStore.initAuth()
  await reportsStore.initialize()

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data?.type === 'OFFLINE_REPORT_SYNCED' && event.data.reportId) {
        if (!reportsStore.myReportIds.includes(event.data.reportId)) {
          reportsStore.myReportIds.push(event.data.reportId)
          localStorage.setItem('myReportIds', JSON.stringify(reportsStore.myReportIds))
        }
        await reportsStore.loadReports()
        // Also start watching this new report for status updates
        reporterNotifStore.watchReport(event.data.reportId)
      }
    })
  }

  // Mulai memantau laporan warga setelah data selesai dimuat
  // initialize() sudah selesai, jadi myReportIds pasti sudah ter-load dari localStorage
  if (!authStore.user && reportsStore.myReportIds.length > 0) {
    reporterNotifStore.startWatching(reportsStore.myReportIds)
  }

  // ── Refresh data ketika PWA kembali ke foreground (dari background/minimize) ──
  // Ini mengatasi masalah PWA yang menampilkan data lama saat dibuka kembali
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      // Reload laporan dari Firestore untuk mendapatkan data terbaru
      await reportsStore.loadReports()
      // Restart watcher agar listener Firestore yang mungkin terputus di-reconnect
      if (!authStore.user && reportsStore.myReportIds.length > 0) {
        reporterNotifStore.restartWatching(reportsStore.myReportIds)
      }
    }
  })
})

// Watch auth state: start/stop real-time notification listener
watch(
  () => authStore.user,
  (user) => {
    if (user) {
      // Admin logged in -> start listening for new reports
      notifStore.setOnNewReportCallback(() => {
        reportsStore.loadReports()
      })
      notifStore.startListening()
      // Stop reporter listener when admin logs in
      reporterNotifStore.stopAll()
    } else {
      // Admin logged out -> stop listening and clear notifications
      notifStore.stopListening()
      notifStore.clearAll()
      // Restart reporter watcher after logout if there are saved report IDs
      if (reportsStore.myReportIds.length > 0) {
        reporterNotifStore.startWatching(reportsStore.myReportIds)
      }
    }
  },
  { immediate: false },
)

// Watch reporter's report IDs: start watching newly submitted reports
watch(
  () => reportsStore.myReportIds,
  (newIds, oldIds) => {
    if (!authStore.user && newIds.length > 0) {
      // Find any new report IDs that weren't previously watched
      const previousIds = new Set(oldIds || [])
      const brandNewIds = newIds.filter((id) => !previousIds.has(id))
      brandNewIds.forEach((id) => reporterNotifStore.watchReport(id))
    }
  },
  { deep: true },
)

// Handlers
const handleCloseNotification = () => {
  uiStore.hideNotification()
}

const handleSaveChanges = async (updatedData) => {
  const reportId = uiStore.editModal.reportData?.id
  if (!reportId) return

  try {
    await updateReport(reportId, updatedData)
    await reportsStore.loadReports()
    uiStore.closeEditModal()
    uiStore.showNotification('success', 'Berhasil', 'Laporan berhasil diperbarui.')
  } catch (error) {
    uiStore.showNotification('error', 'Gagal', 'Terjadi kesalahan saat menyimpan perubahan.')
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-brand-bg font-sans">
    <Header />

    <main class="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Loading state -->
      <div v-if="reportsStore.isLoading && !reportsStore.reports.length" class="text-center p-10">
        <p>Memuat data...</p>
      </div>

      <!-- Router View - This is where page components render -->
      <router-view v-else />
    </main>

    <Footer />

    <!-- Notification Modal -->
    <NotificationModal
      :show="uiStore.notification.show"
      :type="uiStore.notification.type"
      :title="uiStore.notification.title"
      :message="uiStore.notification.message"
      @close="handleCloseNotification"
    />

    <!-- Real-time Toast Notification for New Reports (Admin) -->
    <ToastNotification
      :show="notifStore.showToast"
      :message="notifStore.toastMessage"
      :report-id="notifStore.toastReportId"
      @close="notifStore.closeToast()"
    />

    <!-- Real-time Toast Notification for Status Updates (Reporter) -->
    <ReporterToastNotification
      :show="reporterNotifStore.showToast"
      :message="reporterNotifStore.toastMessage"
      :type="reporterNotifStore.toastType"
      :report-id="reporterNotifStore.toastReportId"
      @close="reporterNotifStore.closeToast()"
    />

    <!-- Edit Report Modal -->
    <div
      v-if="uiStore.editModal.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <EditLaporanForm
          :laporanToEdit="uiStore.editModal.reportData"
          @close-modal="uiStore.closeEditModal()"
          @save-changes="handleSaveChanges"
        />
      </div>
    </div>

    <ReloadPrompt />
  </div>
</template>

