<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const emit = defineEmits(['login-success'])

const loginForm = ref({ email: '', password: '' })
const loginError = ref(null)
const isSubmitting = ref(false)

const handleLogin = async () => {
  isSubmitting.value = true
  loginError.value = null
  try {
    await signInWithEmailAndPassword(auth, loginForm.value.email, loginForm.value.password)
    emit('login-success')
  } catch (error) {
    loginError.value = 'Email atau password salah. Silakan coba lagi.'
    console.error('Login error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
    <h2 class="text-3xl font-bold mb-6 text-center text-brand-green">Login Admin BBKSDA</h2>
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label for="email" class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input
          type="email"
          v-model="loginForm.email"
          id="email"
          class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light"
          required
        />
      </div>
      <div class="mb-6">
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-1"
          >Password</label
        >
        <input
          type="password"
          v-model="loginForm.password"
          id="password"
          class="w-full px-4 py-2 border rounded-lg focus:ring-brand-green-light focus:border-brand-green-light"
          required
        />
      </div>
      <p v-if="loginError" class="text-red-600 text-sm mt-1 mb-4 text-center">{{ loginError }}</p>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-gradient-to-r from-brand-green to-brand-green-light text-white font-bold py-3 rounded-lg hover:shadow-xl transition-all duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>
