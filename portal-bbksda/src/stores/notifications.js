import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'

/**
 * Notifications Store
 * Manages real-time notification state for admin when new reports arrive.
 * Uses Firestore onSnapshot to listen for new reports in real-time.
 */
export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref([])
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastReportId = ref(null)
  const isListening = ref(false)
  const showDropdown = ref(false)

  // Internal tracking
  let unsubscribe = null
  let initialLoadComplete = false
  let knownReportIds = new Set()
  let onNewReportCallback = null

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.read).length
  })

  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 20) // Show last 20 notifications
  })

  // Actions

  /**
   * Start listening for new reports in real-time using Firestore onSnapshot.
   * Only triggers notifications after the initial load is complete.
   */
  const startListening = () => {
    if (isListening.value || unsubscribe) return

    const q = query(
      collection(db, 'laporan'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )

    initialLoadComplete = false
    knownReportIds = new Set()

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!initialLoadComplete) {
          // First load: record all existing report IDs, don't notify
          snapshot.docs.forEach((doc) => {
            knownReportIds.add(doc.id)
          })
          initialLoadComplete = true
          return
        }

        // After initial load, check for new docs
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !knownReportIds.has(change.doc.id)) {
            knownReportIds.add(change.doc.id)
            const data = change.doc.data()

            const notification = {
              id: `notif-${Date.now()}-${change.doc.id}`,
              reportId: change.doc.id,
              idLaporan: data.idLaporan || change.doc.id,
              pelapor: data.nama || 'Anonim',
              jenisSatwa: data.jenisSatwa || '-',
              lokasi: data.lokasi || '-',
              kategoriKonflik: data.kategoriKonflik || '-',
              timestamp: new Date(),
              read: false,
            }

            // Add to notification list (newest first)
            notifications.value.unshift(notification)

            // Trigger toast
            toastMessage.value = `Laporan baru dari ${notification.pelapor}: ${notification.jenisSatwa} di ${notification.lokasi}`
            toastReportId.value = change.doc.id
            showToast.value = true

            // Play notification sound
            playNotificationSound()

            // Also trigger a data reload in reports store so admin views update
            if (onNewReportCallback) {
              onNewReportCallback()
            }
          }
        })
      },
      (error) => {
        console.error('Error listening for new reports:', error)
      },
    )

    isListening.value = true
  }

  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    isListening.value = false
    initialLoadComplete = false
    knownReportIds = new Set()
  }

  /**
   * Play a subtle notification sound using Web Audio API
   */
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return

      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Two-tone notification chime
      oscillator.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    } catch (e) {
      // Silently ignore audio errors (e.g., autoplay policy)
    }
  }

  /**
   * Register a callback that's called when a new report is detected.
   * This lets App.vue connect the reports store refresh.
   * @param {Function} callback - Called when new report arrives
   */
  const setOnNewReportCallback = (callback) => {
    onNewReportCallback = callback
  }

  /**
   * Mark a notification as read
   */
  const markAsRead = (notificationId) => {
    const notif = notifications.value.find((n) => n.id === notificationId)
    if (notif) {
      notif.read = true
    }
  }

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    notifications.value.forEach((n) => {
      n.read = true
    })
  }

  /**
   * Close toast notification
   */
  const closeToast = () => {
    showToast.value = false
    toastMessage.value = ''
    toastReportId.value = null
  }

  /**
   * Toggle dropdown visibility
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
    toastReportId,
    isListening,
    showDropdown,

    // Getters
    unreadCount,
    recentNotifications,

    // Actions
    startListening,
    stopListening,
    setOnNewReportCallback,
    markAsRead,
    markAllAsRead,
    closeToast,
    toggleDropdown,
    closeDropdown,
    clearAll,
  }
})
