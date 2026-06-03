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
    <div class="bg-white p-7 sm:p-10 rounded-xl border border-stone-200 shadow-sm w-full max-w-sm">
      <!-- Icon & heading -->
      <div class="flex flex-col items-center mb-6">
        <div class="w-12 h-12 rounded-full bg-forest-50 border border-forest-200 flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c59" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-stone-800">Masuk sebagai Admin</h2>
        <p class="text-stone-500 text-sm mt-1 text-center">Masukkan kredensial Anda untuk melanjutkan</p>
      </div>

      <form @submit.prevent="handleLogin">
        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <svg class="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ error }}
        </div>

        <!-- Email Field -->
        <div class="mb-5">
          <label for="email" class="block text-sm font-semibold text-stone-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            v-model="email"
            id="email"
            class="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-forest-300 focus:border-forest-500 outline-none transition-colors bg-white"
            placeholder="admin@example.com"
            required
          />
        </div>

        <!-- Password Field -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-semibold text-stone-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            v-model="password"
            id="password"
            class="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-forest-300 focus:border-forest-500 outline-none transition-colors bg-white"
            placeholder="Masukkan password"
            required
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-forest-600 text-white font-semibold py-2.5 rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <span v-if="!isLoading">Masuk</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg
              class="animate-spin h-4 w-4"
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
