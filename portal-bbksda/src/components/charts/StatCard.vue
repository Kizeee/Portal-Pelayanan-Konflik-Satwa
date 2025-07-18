<script setup>
defineProps({
  title: String,
  value: Number,
  icon: String,
  color: String,
});
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4">
    <div class="rounded-full p-3" :class="color">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
      </svg>
    </div>
    <div>
      <p class="text-gray-500 text-sm font-medium">{{ title }}</p>
      <p class="text-3xl font-bold text-gray-800">{{ value }}</p>
    </div>
  </div>
</template>