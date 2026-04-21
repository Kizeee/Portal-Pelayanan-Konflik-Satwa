import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'

/**
 * Composable for authentication operations
 * @returns Authentication functions
 */
export function useAuth() {
  /**
   * Sign in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<UserCredential>}
   */
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Get current authentication state
   * @returns {Object} Auth instance
   */
  const getAuth = () => auth

  return {
    signIn,
    signOut,
    getAuth,
  }
}
