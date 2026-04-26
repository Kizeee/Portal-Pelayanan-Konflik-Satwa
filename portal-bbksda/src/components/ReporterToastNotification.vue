<script setup>
import { watch, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  show: Boolean,
  message: String,
  type: { type: String, default: 'info' }, // 'info', 'success', 'warning'
  reportId: String,
});

const emit = defineEmits(['close']);
const router = useRouter();
const isVisible = ref(false);
const progress = ref(100);
let timer = null;
let progressTimer = null;

const DURATION = 8000; // 8 seconds (longer for important updates)
const PROGRESS_INTERVAL = 30;

const typeConfig = {
  info: {
    gradient: 'from-blue-400 to-indigo-600',
    shadow: 'shadow-blue-200',
    progressBg: 'from-blue-400 to-indigo-500',
    icon: '📋',
  },
  success: {
    gradient: 'from-emerald-400 to-green-600',
    shadow: 'shadow-green-200',
    progressBg: 'from-emerald-400 to-green-500',
    icon: '🚗',
  },
  warning: {
    gradient: 'from-amber-400 to-orange-500',
    shadow: 'shadow-orange-200',
    progressBg: 'from-amber-400 to-orange-500',
    icon: '⚠️',
  },
};

watch(() => props.show, (newValue) => {
  if (newValue) {
    isVisible.value = true;
    progress.value = 100;

    clearTimeout(timer);
    clearInterval(progressTimer);

    const totalSteps = DURATION / PROGRESS_INTERVAL;
    const decrementPerStep = 100 / totalSteps;

    progressTimer = setInterval(() => {
      progress.value = Math.max(0, progress.value - decrementPerStep);
    }, PROGRESS_INTERVAL);

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

const config = () => typeConfig[props.type] || typeConfig.info;
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
        <!-- Progress bar -->
        <div class="h-1 bg-gray-100 overflow-hidden">
          <div
            class="h-full bg-gradient-to-r transition-all duration-100 ease-linear"
            :class="config().progressBg"
            :style="{ width: progress + '%' }"
          ></div>
        </div>

        <div class="p-4">
          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <div
                class="h-10 w-10 rounded-full flex items-center justify-center shadow-lg text-lg animate-notif-bounce bg-gradient-to-br"
                :class="[config().gradient, config().shadow]"
              >
                <span class="filter drop-shadow-sm">{{ config().icon }}</span>
              </div>
            </div>

            <!-- Content -->
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span class="inline-block h-2 w-2 rounded-full animate-pulse"
                  :class="{
                    'bg-blue-500': type === 'info',
                    'bg-green-500': type === 'success',
                    'bg-amber-500': type === 'warning',
                  }"
                ></span>
                Update Laporan Anda!
              </p>
              <p class="mt-1 text-sm text-gray-600 leading-relaxed">{{ message }}</p>
              <button
                v-if="reportId"
                @click="handleViewDetail"
                class="mt-2 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                :class="{
                  'text-blue-600 hover:text-blue-700': type === 'info',
                  'text-emerald-600 hover:text-emerald-700': type === 'success',
                  'text-amber-600 hover:text-amber-700': type === 'warning',
                }"
              >
                Lihat Detail Laporan
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Close -->
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
