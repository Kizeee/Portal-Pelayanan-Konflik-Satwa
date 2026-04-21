import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * UI Store
 * Manages UI state (modals, notifications, etc.)
 */
export const useUIStore = defineStore('ui', () => {
  // Notification state
  const notification = ref({
    show: false,
    type: '',
    title: '',
    message: '',
  })

  // Edit modal state
  const editModal = ref({
    show: false,
    reportData: null,
  })


  // Actions
  /**
   * Show notification modal
   * @param {string} type - Notification type (success, error, info)
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   */
  const showNotification = (type, title, message) => {
    notification.value = {
      show: true,
      type,
      title,
      message,
    }
  }

  /**
   * Hide notification modal
   */
  const hideNotification = () => {
    notification.value.show = false
  }

  /**
   * Open edit report modal
   * @param {Object} reportData - Report data to edit
   */
  const openEditModal = (reportData) => {
    editModal.value = {
      show: true,
      reportData,
    }
  }

  /**
   * Close edit modal
   */
  const closeEditModal = () => {
    editModal.value = {
      show: false,
      reportData: null,
    }
  }


  return {
    // State
    notification,
    editModal,


    // Actions
    showNotification,
    hideNotification,
    openEditModal,
    closeEditModal,

  }
})
