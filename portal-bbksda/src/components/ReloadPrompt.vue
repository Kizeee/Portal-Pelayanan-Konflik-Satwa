<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

const close = async () => {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div
    v-if="offlineReady || needRefresh"
    class="fixed right-0 bottom-0 m-4 p-4 rounded-lg shadow-lg bg-white border border-gray-200 z-[4000]"
    role="alert"
  >
    <div class="flex items-start">
      <div class="ml-3">
        <p v-if="offlineReady" class="text-sm font-medium text-gray-900">
          Aplikasi siap digunakan secara offline.
        </p>
        <p v-else class="text-sm font-medium text-gray-900">
          Versi baru tersedia, muat ulang untuk update.
        </p>
      </div>
      <div class="ml-4 flex-shrink-0">
        <button
          v-if="needRefresh"
          @click="updateServiceWorker()"
          class="bg-brand-green text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-brand-green-light transition-colors"
        >
          Muat Ulang
        </button>
        <button
          @click="close"
          class="ml-2 bg-white rounded-md p-1 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <span class="sr-only">Close</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>