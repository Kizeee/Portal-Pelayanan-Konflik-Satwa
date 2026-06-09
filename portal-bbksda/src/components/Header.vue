<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import NotificationDropdown from './NotificationDropdown.vue'
import ReporterNotificationDropdown from './ReporterNotificationDropdown.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)
const showSafetyModal = ref(false)
const emergencyTelHref = 'tel:081374742981'

const navLinkClass = (routeName) => {
  return route.name === routeName
    ? 'text-forest-700 font-semibold border-b-2 border-forest-700'
    : 'text-stone-600 hover:text-forest-700 transition-colors duration-200'
}

const navigateAndClose = (routeName) => {
  router.push({ name: routeName })
  mobileMenuOpen.value = false
}

const openSafetyModal = () => {
  if (route.name === 'Lapor') {
    mobileMenuOpen.value = false
    return
  }

  showSafetyModal.value = true
  mobileMenuOpen.value = false
}

const continueToReport = () => {
  showSafetyModal.value = false
  router.push({ name: 'Lapor' })
}

const handleLogout = async () => {
  await authStore.logout()
  navigateAndClose('Home')
}
</script>

<template>
  <header class="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0" style="z-index: 9999">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-18" style="height: 72px;">
        <div class="flex items-center space-x-3 cursor-pointer" @click="router.push({ name: authStore.user ? 'Dashboard' : 'Home' })">
          <img src="/logo-BBKSDA.png" alt="Logo BBKSDA Riau" class="h-9 w-9 object-contain" />
          <span class="text-lg font-bold text-stone-800 tracking-tight">BBKSDA Riau</span>
        </div>

        <div class="hidden md:flex items-center space-x-7">
          <template v-if="authStore.user">
            <a
              href="#"
              @click.prevent="router.push({ name: 'Dashboard' })"
              :class="navLinkClass('Dashboard')"
              class="text-sm pb-0.5"
            >Statistik</a>
            <a href="#" @click.prevent="router.push({ name: 'Peta' })" :class="navLinkClass('Peta')"
              class="text-sm pb-0.5"
            >Peta Sebaran</a>
            <a href="#" @click.prevent="router.push({ name: 'LihatLaporan' })" :class="navLinkClass('LihatLaporan')"
              class="text-sm pb-0.5"
            >Laporan</a>
            <!-- Notification Bell for Admin -->
            <NotificationDropdown />
            <button
              @click="handleLogout"
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 border border-stone-300 px-3 py-1.5 rounded-lg hover:bg-stone-100 hover:border-stone-400 transition-colors"
            >
              <!-- Logout icon (door-exit style) -->
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </template>

          <template v-else>
            <a href="#" @click.prevent="router.push({ name: 'Home' })" :class="navLinkClass('Home')"
              class="text-sm pb-0.5"
            >Beranda</a>
            <a href="#" @click.prevent="openSafetyModal" :class="navLinkClass('Lapor')"
              class="text-sm pb-0.5"
            >Buat Laporan</a>
            <a href="#" @click.prevent="router.push({ name: 'Panduan' })" :class="navLinkClass('Panduan')"
              class="text-sm pb-0.5"
            >Panduan</a>
            <a
              href="#"
              @click.prevent="router.push({ name: 'LaporanSaya' })"
              :class="navLinkClass('LaporanSaya')"
              class="text-sm pb-0.5"
            >Laporan Saya</a>
            <!-- Reporter Notification Bell -->
            <ReporterNotificationDropdown />
            <a href="#" @click.prevent="router.push({ name: 'Login' })" :class="navLinkClass('Login')"
              class="text-sm pb-0.5"
            >Login Admin</a>
          </template>
        </div>

        <div class="md:hidden flex items-center space-x-2">
          <template v-if="authStore.user">
            <NotificationDropdown />
          </template>
          <template v-else>
            <ReporterNotificationDropdown />
          </template>
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-stone-600 p-1 rounded-md hover:bg-stone-100 transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <div v-show="mobileMenuOpen" class="md:hidden bg-white border-t border-stone-100 shadow-sm">
      <template v-if="authStore.user">
        <a
          href="#"
          @click.prevent="navigateAndClose('Dashboard')"
          class="block py-3 px-5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-forest-700 transition-colors"
        >Statistik</a>
        <a
          href="#"
          @click.prevent="navigateAndClose('Peta')"
          class="block py-3 px-5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-forest-700 transition-colors"
        >Peta Sebaran</a>
        <a
          href="#"
          @click.prevent="navigateAndClose('LihatLaporan')"
          class="block py-3 px-5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-forest-700 transition-colors"
        >Laporan</a>
        <a
          href="#"
          @click.prevent="handleLogout"
          class="block py-3 px-5 text-sm font-medium text-stone-500 hover:bg-stone-50 transition-colors"
        >Logout</a>
      </template>

      <template v-else>
        <a
          href="#"
          @click.prevent="navigateAndClose('Home')"
          class="block py-3 px-5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-forest-700 transition-colors"
        >Beranda</a>
        <a
          href="#"
          @click.prevent="openSafetyModal"
          class="block py-3 px-5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-forest-700 transition-colors"
        >Buat Laporan</a>
        <a
          href="#"
          @click.prevent="navigateAndClose('Panduan')"
          class="block py-3 px-5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-forest-700 transition-colors"
        >Panduan</a>
        <a
          href="#"
          @click.prevent="navigateAndClose('LaporanSaya')"
          class="block py-3 px-5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-forest-700 transition-colors"
        >Laporan Saya</a>
        <a
          href="#"
          @click.prevent="navigateAndClose('Login')"
          class="block py-3 px-5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-forest-700 transition-colors"
        >Login Admin</a>
      </template>
    </div>

  </header>

  <Teleport to="body">
    <div
      v-if="showSafetyModal"
      class="fixed inset-0 bg-stone-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="header-safety-title"
      @click.self="showSafetyModal = false"
    >
      <div class="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-white border border-red-300 rounded-xl shadow-xl p-6 sm:p-8 text-center">
        <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
        </div>
        <h2 id="header-safety-title" class="text-lg font-bold text-red-800 uppercase tracking-wide mb-3">Peringatan Aman</h2>
        <p class="text-stone-700 leading-relaxed text-sm">
          PERINGATAN: Apakah Anda sudah berada di lokasi yang aman? Jika satwa masih mengancam nyawa, JANGAN isi formulir ini. Segera hubungi kontak darurat.
        </p>
        <div class="mt-5 flex flex-col gap-3">
          <a
            :href="emergencyTelHref"
            class="bg-red-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Hubungi Darurat Sekarang
          </a>
          <button
            @click="continueToReport"
            class="text-stone-600 font-semibold py-3 px-5 rounded-lg hover:text-forest-700 hover:underline transition-colors text-sm"
          >
            Saya Aman, Lanjut Isi Form
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
