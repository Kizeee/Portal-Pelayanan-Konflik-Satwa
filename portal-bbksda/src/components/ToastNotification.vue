<script setup>
import { watch, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  show: Boolean,
  message: String,
  reportId: String,
});

const emit = defineEmits(['close']);
const router = useRouter();
const isVisible = ref(false);
const progress = ref(100);
let timer = null;
let progressTimer = null;

const DURATION = 6000; // 6 seconds
const PROGRESS_INTERVAL = 30;

watch(() => props.show, (newValue) => {
  if (newValue) {
    isVisible.value = true;
    progress.value = 100;

    // Clear previous timers
    clearTimeout(timer);
    clearInterval(progressTimer);

    // Progress bar countdown
    const totalSteps = DURATION / PROGRESS_INTERVAL;
    const decrementPerStep = 100 / totalSteps;

    progressTimer = setInterval(() => {
      progress.value = Math.max(0, progress.value - decrementPerStep);
    }, PROGRESS_INTERVAL);

    // Auto-close timer
    timer = setTimeout(() => {
      handleClose();
    }, DURATION);
  }
});

const handleClose = () => {
  clearTimeout(timer);
  clearInterval(progressTimer);
  isVisible.value = false;
  emit('close');
};

const handleViewDetail = () => {
  if (props.reportId) {
    handleClose();
    router.push({ name: 'Detail', params: { id: props.reportId } });
  }
};
</script>

<template>
  <transition
    enter-active-class="transform ease-out duration-500 transition"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div v-if="show && isVisible" class="fixed top-24 right-3 left-3 sm:left-auto sm:right-5 z-[10001] w-auto sm:w-full sm:max-w-sm">
      <div class="rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <!-- Progress bar at top -->
        <div class="h-1 bg-gray-100 overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-100 ease-linear"
            :style="{ width: progress + '%' }"
          ></div>
        </div>

        <div class="p-4">
          <div class="flex items-start">
            <!-- Animated Bell Icon -->
            <div class="flex-shrink-0">
              <div class="h-10 w-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200 animate-notif-bounce">
                <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span class="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Laporan Baru Masuk!
              </p>
              <p class="mt-1 text-sm text-gray-600 leading-relaxed">{{ message }}</p>
              <button
                v-if="reportId"
                @click="handleViewDetail"
                class="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
              >
                Lihat Detail
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Close button -->
            <div class="ml-3 flex-shrink-0">
              <button
                @click="handleClose"
                class="bg-white rounded-full p-1 inline-flex text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
              >
                <span class="sr-only">Tutup</span>
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
@keyframes notif-bounce {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(6deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(2deg); }
  60% { transform: rotate(0deg); }
}
.animate-notif-bounce {
  animation: notif-bounce 1s ease-in-out;
}
</style>