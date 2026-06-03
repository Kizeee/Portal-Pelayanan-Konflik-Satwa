import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { useReportsStore } from './reports'

/**
 * Reporter Notifications Store
 * Monitors status changes for the reporter's own reports using
 * Firestore onSnapshot listeners. Notifies the reporter in real-time
 * when admin updates their report status (e.g., "Tim Menuju Lokasi").
 */
export const useReporterNotificationsStore = defineStore('reporterNotifications', () => {
  // State
  const notifications = ref([])
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref('info') // 'info', 'success', 'warning'
  const toastReportId = ref(null)
  const showDropdown = ref(false)

  // Internal tracking
  const listeners = new Map() // reportId -> unsubscribe function
  const knownStatuses = new Map() // reportId -> last known status

  // Status labels in Indonesian
  const STATUS_LABELS = {
    'Menunggu Verifikasi': 'Menunggu Verifikasi',
    pending: 'Menunggu Verifikasi', // bkwd
    Diterima: 'Diterima',
    verified: 'Diterima', // bkwd
    'Tim Menuju Lokasi': 'Tim Menuju Lokasi',
    'Penanganan di Lokasi': 'Penanganan di Lokasi',
    Diproses: 'Penanganan di Lokasi', // bkwd
    Selesai: 'Selesai',
    Ditolak: 'Ditolak',
    'Tidak Valid': 'Ditolak', // bkwd
  }

  // Status to notification config mapping
  const STATUS_CONFIG = {
    Diterima: {
      type: 'info',
      icon: '📋',
      message: (id) => `Laporan ${id} telah diterima & divalidasi oleh admin BBKSDA.`,
    },
    verified: { // bkwd
      type: 'info',
      icon: '📋',
      message: (id) => `Laporan ${id} telah divalidasi.`,
    },
    'Tim Menuju Lokasi': {
      type: 'success',
      icon: '🚗',
      message: (id) => `Tim petugas BBKSDA sedang menuju lokasi Anda! (${id})`,
    },
    'Penanganan di Lokasi': {
      type: 'info',
      icon: '⚙️',
      message: (id) => `Laporan ${id} sedang dalam proses penanganan di lapangan.`,
    },
    Diproses: { // bkwd
      type: 'info',
      icon: '⚙️',
      message: (id) => `Laporan ${id} sedang dalam penanganan.`,
    },
    Selesai: {
      type: 'success',
      icon: '🎉',
      message: (id) => `Penanganan laporan ${id} telah selesai. Terima kasih!`,
    },
    Ditolak: {
      type: 'warning',
      icon: '❌',
      message: (id) => `Laporan ${id} dinyatakan ditolak/tidak valid.`,
    },
    'Tidak Valid': { // bkwd
      type: 'warning',
      icon: '❌',
      message: (id) => `Laporan ${id} dinyatakan tidak valid.`,
    },
  }

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.read).length
  })

  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 30)
  })

  // Actions
  const RECENT_STATUS_WINDOW_MS = 2 * 60 * 1000
  const INITIAL_STATUSES = new Set(['Menunggu Verifikasi', 'pending'])

  const toDate = (value) => {
    if (!value) return null
    const date = value.toDate ? value.toDate() : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const isRecentExistingStatusChange = (data, currentStatus) => {
    if (INITIAL_STATUSES.has(currentStatus)) return false

    const history = Array.isArray(data.statusHistory) ? data.statusHistory : []
    const latest = history[history.length - 1]
    if (!latest || latest.status !== currentStatus) return false

    const timestamp = toDate(latest.timestamp)
    if (!timestamp) return false

    const age = Date.now() - timestamp.getTime()
    return age >= 0 && age <= RECENT_STATUS_WINDOW_MS
  }

  const pushStatusNotification = (reportId, data, currentStatus) => {
    const config = STATUS_CONFIG[currentStatus]
    const idLaporan = data.idLaporan || reportId

    const notification = {
      id: `rn-${Date.now()}-${reportId}`,
      reportId,
      idLaporan,
      status: currentStatus,
      statusLabel: STATUS_LABELS[currentStatus] || currentStatus,
      icon: config?.icon || 'ðŸ“Œ',
      message: config
        ? config.message(idLaporan)
        : `Status laporan ${idLaporan} berubah menjadi: ${currentStatus}`,
      type: config?.type || 'info',
      timestamp: new Date(),
      read: false,
      // Extra context from latest statusHistory entry
      notes: getLatestNotes(data.statusHistory),
    }

    notifications.value.unshift(notification)

    // Show toast
    toastMessage.value = notification.message
    toastType.value = notification.type
    toastReportId.value = reportId
    showToast.value = true

    // Play sound
    playNotificationSound(notification.type)
  }

  const handleReportUpdate = (reportId, data, { syncStore = true } = {}) => {
    if (!reportId || !data?.status) return

    const currentStatus = data.status
    const previousStatus = knownStatuses.get(reportId)

    if (syncStore) {
      try {
        const reportsStore = useReportsStore()
        reportsStore.upsertReport({ id: reportId, ...data })
      } catch (e) {
        // Abaikan jika store belum siap
      }
    }

    // Record the status on first load without notifying
    if (!knownStatuses.has(reportId)) {
      knownStatuses.set(reportId, currentStatus)
      if (isRecentExistingStatusChange(data, currentStatus)) {
        pushStatusNotification(reportId, data, currentStatus)
      }
      return
    }

    // Only notify if the status actually changed
    if (currentStatus !== previousStatus) {
      knownStatuses.set(reportId, currentStatus)
      pushStatusNotification(reportId, data, currentStatus)
    }
  }

  /**
   * Start listening for changes to a specific report
   */
  const watchReport = (reportId) => {
    if (listeners.has(reportId)) return // Already watching

    const reportRef = doc(db, 'laporan', reportId)

    const unsubscribe = onSnapshot(
      reportRef,
      (snapshot) => {
        if (!snapshot.exists()) return

        handleReportUpdate(reportId, snapshot.data())

        /*
        const data = snapshot.data()
        const currentStatus = data.status
        const previousStatus = knownStatuses.get(reportId)

        // ── Real-time patch: update data laporan di reports store ──
        // Ini membuat tampilan LaporanSayaPage & DetailPage langsung terupdate
        // tanpa perlu reload seluruh koleksi dari Firestore.
        try {
          const reportsStore = useReportsStore()
          reportsStore.upsertReport({ id: reportId, ...data })
        } catch (e) {
          // Abaikan jika store belum siap
        }

        // Record the status on first load without notifying
        if (!knownStatuses.has(reportId)) {
          knownStatuses.set(reportId, currentStatus)
          return
        }

        // Only notify if the status actually changed
        if (currentStatus !== previousStatus) {
          knownStatuses.set(reportId, currentStatus)

          const config = STATUS_CONFIG[currentStatus]
          const idLaporan = data.idLaporan || reportId

          const notification = {
            id: `rn-${Date.now()}-${reportId}`,
            reportId,
            idLaporan,
            status: currentStatus,
            statusLabel: STATUS_LABELS[currentStatus] || currentStatus,
            icon: config?.icon || '📌',
            message: config
              ? config.message(idLaporan)
              : `Status laporan ${idLaporan} berubah menjadi: ${currentStatus}`,
            type: config?.type || 'info',
            timestamp: new Date(),
            read: false,
            // Extra context from latest statusHistory entry
            notes: getLatestNotes(data.statusHistory),
          }

          notifications.value.unshift(notification)

          // Show toast
          toastMessage.value = notification.message
          toastType.value = notification.type
          toastReportId.value = reportId
          showToast.value = true

          // Play sound
          playNotificationSound(notification.type)
        }
        */
      },
      (error) => {
        console.error(`Error watching report ${reportId}:`, error)
      },
    )

    listeners.set(reportId, unsubscribe)
  }

  /**
   * Get the latest notes from statusHistory array
   */
  const getLatestNotes = (statusHistory) => {
    if (!statusHistory || !Array.isArray(statusHistory) || statusHistory.length === 0) {
      return ''
    }
    const latest = statusHistory[statusHistory.length - 1]
    return latest?.notes || ''
  }

  /**
   * Start watching all reports that belong to this reporter
   * @param {string[]} reportIds - Array of report IDs tracked in the current session
   */
  const startWatching = (reportIds) => {
    if (!reportIds || reportIds.length === 0) return
    reportIds.forEach((id) => watchReport(id))
  }

  const syncReportsFromStore = (reports, reportIds) => {
    if (!reports || reports.length === 0) return

    const trackedIds = new Set(reportIds || [])
    reports.forEach((report) => {
      if (!report?.id) return
      if (trackedIds.size > 0 && !trackedIds.has(report.id)) return
      handleReportUpdate(report.id, report, { syncStore: false })
    })
  }

  /**
   * Restart watching all given reportIds — useful when PWA returns from background.
   * Tears down existing (possibly stale) listeners and creates new ones.
   */
  const restartWatching = (reportIds) => {
    if (!reportIds || reportIds.length === 0) return
    // Unsubscribe each listener individually so we keep knownStatuses intact
    // (avoids showing duplicate notifications for statuses already seen)
    reportIds.forEach((id) => {
      if (listeners.has(id)) {
        listeners.get(id)() // call unsubscribe
        listeners.delete(id)
      }
    })
    // Re-subscribe
    reportIds.forEach((id) => watchReport(id))
  }

  /**
   * Stop all listeners
   */
  const stopAll = () => {
    listeners.forEach((unsubscribe) => unsubscribe())
    listeners.clear()
    knownStatuses.clear()
  }

  /**
   * Play notification sound
   */
  const playNotificationSound = (type = 'info') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return

      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'success') {
        // Uplifting two-tone
        osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15) // G5
      } else if (type === 'warning') {
        // Lower tone
        osc.frequency.setValueAtTime(349.23, ctx.currentTime) // F4
        osc.frequency.setValueAtTime(293.66, ctx.currentTime + 0.15) // D4
      } else {
        // Neutral info chime
        osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15) // G5
      }

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) {
      // Silently ignore
    }
  }

  /**
   * Mark notification as read
   */
  const markAsRead = (notificationId) => {
    const n = notifications.value.find((n) => n.id === notificationId)
    if (n) n.read = true
  }

  /**
   * Mark all as read
   */
  const markAllAsRead = () => {
    notifications.value.forEach((n) => {
      n.read = true
    })
  }

  /**
   * Close toast
   */
  const closeToast = () => {
    showToast.value = false
    toastMessage.value = ''
    toastReportId.value = null
  }

  /**
   * Toggle dropdown
   */
  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }

  /**
   * Close dropdown
   */
  const closeDropdown = () => {
    showDropdown.value = false
  }

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    notifications.value = []
  }

  return {
    // State
    notifications,
    showToast,
    toastMessage,
    toastType,
    toastReportId,
    showDropdown,

    // Getters
    unreadCount,
    recentNotifications,

    // Actions
    startWatching,
    restartWatching,
    syncReportsFromStore,
    watchReport,
    stopAll,
    markAsRead,
    markAllAsRead,
    closeToast,
    toggleDropdown,
    closeDropdown,
    clearAll,
  }
})
