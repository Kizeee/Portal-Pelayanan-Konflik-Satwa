/**
 * Global error handler utility
 * Provides consistent error handling across the application
 */

/**
 * Handle API/Firebase errors and show user-friendly messages
 * @param {Error} error - The error object
 * @param {Object} uiStore - UI store instance for showing notifications
 */
export const handleApiError = (error, uiStore) => {
  console.error('API Error:', error)

  let title = 'Terjadi Kesalahan'
  let message = 'Silakan coba lagi nanti'

  // Firebase Auth errors
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        title = 'Login Gagal'
        message = 'Email atau password salah'
        break

      case 'auth/invalid-email':
        title = 'Email Tidak Valid'
        message = 'Format email tidak benar'
        break

      case 'auth/too-many-requests':
        title = 'Terlalu Banyak Percobaan'
        message = 'Akun sementara diblokir. Coba lagi nanti.'
        break

      case 'auth/network-request-failed':
        title = 'Tidak Ada Koneksi'
        message = 'Periksa koneksi internet Anda'
        break

      // Firestore errors
      case 'permission-denied':
        title = 'Akses Ditolak'
        message = 'Anda tidak memiliki izin untuk aksi ini'
        break

      case 'unavailable':
        title = 'Layanan Tidak Tersedia'
        message = 'Server sedang sibuk, coba lagi sebentar'
        break

      case 'deadline-exceeded':
        title = 'Waktu Habis'
        message = 'Permintaan memakan waktu terlalu lama'
        break

      default:
        if (error.code.startsWith('auth/')) {
          title = 'Kesalahan Autentikasi'
          message = error.message || 'Terjadi kesalahan saat autentikasi'
        }
    }
  }

  // Network errors
  if (error.message === 'Network Error' || error.message === 'Failed to fetch') {
    title = 'Tidak Ada Koneksi'
    message = 'Periksa koneksi internet Anda'
  }

  // Check if offline
  if (!navigator.onLine) {
    title = 'Offline'
    message = 'Anda sedang offline. Periksa koneksi internet Anda.'
  }

  // Show notification
  if (uiStore && uiStore.showNotification) {
    uiStore.showNotification('error', title, message)
  }

  return { title, message }
}

/**
 * Handle file upload errors
 * @param {Error} error - The error object
 * @param {Object} uiStore - UI store instance
 */
export const handleUploadError = (error, uiStore) => {
  console.error('Upload Error:', error)

  let title = 'Gagal Mengunggah File'
  let message = 'Terjadi kesalahan saat mengunggah file'

  if (error.message?.includes('large')) {
    title = 'File Terlalu Besar'
    message = 'Ukuran file melebihi batas maksimal'
  } else if (error.message?.includes('type')) {
    title = 'Tipe File Tidak Didukung'
    message = 'Format file tidak didukung'
  }

  if (uiStore && uiStore.showNotification) {
    uiStore.showNotification('error', title, message)
  }

  return { title, message }
}

/**
 * Check if user is online
 * @returns {boolean}
 */
export const isOnline = () => {
  return navigator.onLine
}

/**
 * Format error message for display
 * @param {Error} error
 * @returns {string}
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error
  if (error.message) return error.message
  return 'Terjadi kesalahan yang tidak diketahui'
}
