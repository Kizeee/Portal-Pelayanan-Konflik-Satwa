<script setup>
defineProps({
  show: Boolean,
  type: String,
  title: String,
  message: String,
});

const emit = defineEmits(['close']);
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-md flex items-center justify-center z-[2000]">
      <div class="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-auto text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" :class="type === 'success' ? 'bg-green-100' : 'bg-red-100'">
          <svg v-if="type === 'success'" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <svg v-else class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <p class="text-sm text-gray-500 mt-2">{{ message }}</p>
        <div class="mt-4">
          <button @click="emit('close')" class="px-6 py-2 rounded-md text-white" :class="type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'">Tutup</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>