<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReporterNotificationsStore } from '../stores/reporterNotifications'

const router = useRouter()
const notifStore = useReporterNotificationsStore()

const dropdownRef = ref(null)

const formatTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleViewReport = (notif) => {
  notifStore.markAsRead(notif.id)
  notifStore.closeDropdown()
  router.push({ name: 'Detail', params: { id: notif.reportId } })
}

const typeStyles = {
  success: 'from-emerald-400 to-green-600',
  info: 'from-blue-400 to-blue-600',
  warning: 'from-amber-400 to-orange-500',
}

const typeBg = {
  success: 'bg-gradient-to-br from-emerald-100 to-green-200',
  info: 'bg-gradient-to-br from-blue-100 to-blue-200',
  warning: 'bg-gradient-to-br from-amber-100 to-orange-200',
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    notifStore.closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Bell Button -->
    <button
      @click.stop="notifStore.toggleDropdown()"
      class="relative p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-300 focus:outline-none"
      title="Status Laporan Saya"
    >
      <svg
        class="h-6 w-6 transition-transform"
        :class="{ 'animate-ring': notifStore.unreadCount > 0 }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>

      <!-- Badge -->
      <transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="scale-0 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-0 opacity-0"
      >
        <span
          v-if="notifStore.unreadCount > 0"
          class="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-[10px] font-bold ring-2 ring-white"
        >
          {{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}
        </span>
      </transition>
    </button>

    <!-- Dropdown Panel -->
    <transition
      enter-active-class="transform ease-out duration-200 transition"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="notifStore.showDropdown"
        class="absolute right-0 mt-3 w-96 max-h-[480px] bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden"
        style="z-index: 10000"
      >
        <!-- Header -->
        <div class="px-5 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <h3 class="font-bold text-base">Update Laporan</h3>
              <span
                v-if="notifStore.unreadCount > 0"
                class="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
              >
                {{ notifStore.unreadCount }} baru
              </span>
            </div>
            <button
              v-if="notifStore.unreadCount > 0"
              @click="notifStore.markAllAsRead()"
              class="text-xs font-medium text-white/80 hover:text-white transition-colors"
            >
              Tandai Dibaca
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="overflow-y-auto max-h-[360px] divide-y divide-gray-100">
          <div
            v-for="notif in notifStore.recentNotifications"
            :key="notif.id"
            @click="handleViewReport(notif)"
            class="px-5 py-4 cursor-pointer transition-all duration-200 hover:bg-blue-50/60 relative"
            :class="{ 'bg-blue-50/40': !notif.read }"
          >
            <!-- Unread Indicator -->
            <div
              v-if="!notif.read"
              class="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500"
            ></div>

            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div
                class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-lg"
                :class="notif.read ? 'bg-gray-100' : (typeBg[notif.type] || 'bg-blue-100')"
              >
                {{ notif.icon }}
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-bold text-gray-800">
                    {{ notif.idLaporan }}
                    <span
                      class="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                      :class="{
                        'bg-amber-100 text-amber-700': notif.status === 'Menunggu Verifikasi' || notif.status === 'pending',
                        'bg-blue-100 text-blue-700': notif.status === 'Diterima' || notif.status === 'verified',
                        'bg-emerald-100 text-emerald-700': notif.status === 'Tim Menuju Lokasi',
                        'bg-yellow-100 text-yellow-700': notif.status === 'Penanganan di Lokasi' || notif.status === 'Diproses',
                        'bg-green-100 text-green-700': notif.status === 'Selesai',
                        'bg-red-100 text-red-700': notif.status === 'Ditolak' || notif.status === 'Tidak Valid',
                      }"
                    >
                      {{ notif.statusLabel }}
                    </span>
                  </p>
                  <span class="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {{ formatTime(notif.timestamp) }}
                  </span>
                </div>

                <p class="text-xs text-gray-600 mt-1 leading-relaxed">
                  {{ notif.message }}
                </p>

                <p
                  v-if="notif.notes"
                  class="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded italic"
                >
                  📝 {{ notif.notes }}
                </p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="notifStore.recentNotifications.length === 0"
            class="px-5 py-12 text-center"
          >
            <div class="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <svg class="h-8 w-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-500">Belum ada update</p>
            <p class="text-xs text-gray-400 mt-1">Update status laporan Anda akan muncul di sini</p>
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="notifStore.recentNotifications.length > 0"
          class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between"
        >
          <button
            @click="notifStore.clearAll(); notifStore.closeDropdown()"
            class="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
          >
            Hapus Semua
          </button>
          <button
            @click="notifStore.closeDropdown(); $router.push({ name: 'LaporanSaya' })"
            class="text-xs text-blue-600 hover:text-blue-700 transition-colors font-semibold"
          >
            Lihat Semua Laporan →
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@keyframes ring-bell {
  0% { transform: rotate(0deg); }
  5% { transform: rotate(15deg); }
  10% { transform: rotate(-13deg); }
  15% { transform: rotate(10deg); }
  20% { transform: rotate(-8deg); }
  25% { transform: rotate(5deg); }
  30% { transform: rotate(-3deg); }
  35% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-ring {
  animation: ring-bell 2s infinite;
  transform-origin: top center;
}
</style>
