<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUIStore } from '../stores/ui'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  // Simple validation
  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await signIn(email.value, password.value)
    router.push({ name: 'Dashboard' })
  } catch (err) {
    console.error('Login error:', err)
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      error.value = 'Email atau password salah'
    } else if (err.code === 'auth/too-many-requests') {
      error.value = 'Terlalu banyak percobaan. Coba lagi nanti.'
    } else {
      error.value = 'Terjadi kesalahan. Silakan coba lagi.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[70vh] px-4">
    <div class="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl sm:text-3xl font-bold mb-2 text-center text-brand-green">Login Admin</h2>
      <p class="text-center text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">Masukkan kredensial Anda untuk melanjutkan</p>

      <form @submit.prevent="handleLogin">
        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {{ error }}
        </div>

        <!-- Email Field -->
        <div class="mb-6">
          <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            v-model="email"
            id="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            placeholder="admin@example.com"
            required
          />
        </div>

        <!-- Password Field -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            v-model="password"
            id="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-brand-green to-brand-green-light text-white font-bold py-3 rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Login</span>
          <span v-else class="flex items-center justify-center">
            <svg
              class="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Memproses...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>
