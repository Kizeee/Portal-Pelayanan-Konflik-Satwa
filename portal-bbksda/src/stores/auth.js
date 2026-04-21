import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

/**
 * Authentication Store
 * Manages user authentication state
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(true)

  // Actions
  /**
   * Initialize Firebase auth state listener
   */
  const initAuth = () => {
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
      isLoading.value = false
    })
  }

  /**
   * Sign out current user
   */
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return {
    // State
    user,
    isLoading,

    // Actions
    initAuth,
    logout,
  }
})
