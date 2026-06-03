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
    ? 'text-brand-green font-semibold border-b-2 border-brand-green'
    : 'text-gray-600 hover:text-brand-green transition-colors duration-300'
}

const navigateAndClose = (routeName) => {
  router.push({ name: routeName })
  mobileMenuOpen.value = false
}

const openSafetyModal = () => {
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
  <header class="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0" style="z-index: 9999">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <div class="flex items-center space-x-3 cursor-pointer" @click="router.push({ name: authStore.user ? 'Dashboard' : 'Home' })">
          <img src="/logo-BBKSDA.png" alt="Logo BBKSDA Riau" class="h-10 w-10 object-contain" />
          <span class="text-xl font-bold text-gray-800">BBKSDA Riau</span>
        </div>

        <div class="hidden md:flex items-center space-x-8">
          <template v-if="authStore.user">
            <a
              href="#"
              @click.prevent="router.push({ name: 'Dashboard' })"
              :class="navLinkClass('Dashboard')"
              >Statistik</a
            >
            <a href="#" @click.prevent="router.push({ name: 'Peta' })" :class="navLinkClass('Peta')"
              >Peta Sebaran</a
            >
            <a href="#" @click.prevent="router.push({ name: 'LihatLaporan' })" :class="navLinkClass('LihatLaporan')"
              >Laporan</a
            >
            <!-- Notification Bell for Admin -->
            <NotificationDropdown />
            <button
              @click="handleLogout"
              class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
            >
              Logout
            </button>
          </template>

          <template v-else>
            <a href="#" @click.prevent="router.push({ name: 'Home' })" :class="navLinkClass('Home')"
              >Home</a
            >
            <a href="#" @click.prevent="openSafetyModal" :class="navLinkClass('Lapor')"
              >Buat Laporan</a
            >
            <a href="#" @click.prevent="router.push({ name: 'Panduan' })" :class="navLinkClass('Panduan')"
              >Panduan</a
            >
            <a
              href="#"
              @click.prevent="router.push({ name: 'LaporanSaya' })"
              :class="navLinkClass('LaporanSaya')"
              >Laporan Saya</a
            >
            <!-- Reporter Notification Bell -->
            <ReporterNotificationDropdown />
            <a href="#" @click.prevent="router.push({ name: 'Login' })" :class="navLinkClass('Login')"
              >Login Admin</a
            >
          </template>
        </div>

        <div class="md:hidden flex items-center space-x-2">
          <template v-if="authStore.user">
            <NotificationDropdown />
          </template>
          <template v-else>
            <ReporterNotificationDropdown />
          </template>
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <div v-show="mobileMenuOpen" class="md:hidden bg-white border-t">
      <template v-if="authStore.user">
        <a
          href="#"
          @click.prevent="navigateAndClose('Dashboard')"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Statistik</a
        >
        <a
          href="#"
          @click.prevent="navigateAndClose('Peta')"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Peta Sebaran</a
        >
        <a
          href="#"
          @click.prevent="navigateAndClose('LihatLaporan')"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Laporan</a
        >
        <a
          href="#"
          @click.prevent="handleLogout"
          class="block py-3 px-4 text-base font-medium text-red-600 hover:bg-gray-50"
          >Logout</a
        >
      </template>

      <template v-else>
        <a
          href="#"
          @click.prevent="navigateAndClose('Home')"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Home</a
        >
        <a
          href="#"
          @click.prevent="openSafetyModal"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Buat Laporan</a
        >
        <a
          href="#"
          @click.prevent="navigateAndClose('Panduan')"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Panduan</a
        >
        <a
          href="#"
          @click.prevent="navigateAndClose('LaporanSaya')"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Laporan Saya</a
        >
        <a
          href="#"
          @click.prevent="navigateAndClose('Login')"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Login Admin</a
        >
      </template>
    </div>

  </header>

  <Teleport to="body">
    <div
      v-if="showSafetyModal"
      class="fixed inset-0 bg-gray-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="header-safety-title"
      @click.self="showSafetyModal = false"
    >
      <div class="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-white border-2 border-red-500 rounded-xl shadow-2xl p-6 sm:p-8 text-center">
        <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
        </div>
        <h2 id="header-safety-title" class="text-xl font-extrabold text-red-800 uppercase mb-3">Peringatan Aman</h2>
        <p class="text-gray-700 font-semibold leading-relaxed">
          PERINGATAN: Apakah Anda sudah berada di lokasi yang aman? Jika satwa masih mengancam nyawa, JANGAN isi formulir ini. Segera hubungi kontak darurat.
        </p>
        <div class="mt-6 flex flex-col gap-3">
          <a
            :href="emergencyTelHref"
            class="bg-red-600 text-white font-extrabold py-3 px-5 rounded-lg hover:bg-red-700 transition-colors"
          >
            Hubungi Darurat Sekarang
          </a>
          <button
            @click="continueToReport"
            class="text-gray-700 font-bold py-3 px-5 rounded-lg hover:text-brand-green hover:underline transition-colors"
          >
            Saya Aman, Lanjut Isi Form
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
