<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useReportsStore } from '../stores/reports'
import NotificationDropdown from './NotificationDropdown.vue'
import ReporterNotificationDropdown from './ReporterNotificationDropdown.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const reportsStore = useReportsStore()

const mobileMenuOpen = ref(false)

const navLinkClass = (routeName) => {
  return route.name === routeName
    ? 'text-brand-green font-semibold border-b-2 border-brand-green'
    : 'text-gray-600 hover:text-brand-green transition-colors duration-300'
}

const navigateAndClose = (routeName) => {
  router.push({ name: routeName })
  mobileMenuOpen.value = false
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
            <a href="#" @click.prevent="router.push({ name: 'Lapor' })" :class="navLinkClass('Lapor')"
              >Buat Laporan</a
            >
            <a
              v-if="reportsStore.myReportIds.length > 0"
              href="#"
              @click.prevent="router.push({ name: 'LaporanSaya' })"
              :class="navLinkClass('LaporanSaya')"
              >Laporan Saya</a
            >
            <!-- Reporter Notification Bell -->
            <ReporterNotificationDropdown v-if="reportsStore.myReportIds.length > 0" />
            <a href="#" @click.prevent="router.push({ name: 'Login' })" :class="navLinkClass('Login')"
              >Login Admin</a
            >
          </template>
        </div>

        <div class="md:hidden flex items-center space-x-2">
          <template v-if="authStore.user">
            <NotificationDropdown />
          </template>
          <template v-else-if="reportsStore.myReportIds.length > 0">
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
          @click.prevent="navigateAndClose('Lapor')"
          class="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50"
          >Buat Laporan</a
        >
        <a
          v-if="reportsStore.myReportIds.length > 0"
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
</template>
