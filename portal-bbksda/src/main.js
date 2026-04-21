import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

// Daftarkan Service Worker PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Ada versi baru tersedia. Muat ulang untuk memperbarui aplikasi?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('✅ Aplikasi siap digunakan secara offline!')
  },
  onRegisterError(error) {
    console.error('❌ Gagal mendaftarkan Service Worker:', error)
  },
})

// Create Vue app
const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Use Vue Router
app.use(router)

// Mount app
app.mount('#app')
