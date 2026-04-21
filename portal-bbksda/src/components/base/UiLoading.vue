<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['spinner', 'dots', 'pulse'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  color: {
    type: String,
    default: 'primary',
  },
})

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

const colorClasses = {
  primary: 'text-primary-500',
  secondary: 'text-secondary-500',
  white: 'text-white',
}
</script>

<template>
  <div class="inline-flex items-center justify-center">
    <!-- Spinner -->
    <svg
      v-if="type === 'spinner'"
      :class="[spinnerSizes[size], colorClasses[color]]"
      class="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Dots -->
    <div v-else-if="type === 'dots'" class="flex space-x-1">
      <div
        v-for="i in 3"
        :key="i"
        :class="[
          size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3',
          colorClasses[color],
        ]"
        class="rounded-full animate-bounce bg-current"
        :style="{ animationDelay: `${i * 0.1}s` }"
      ></div>
    </div>

    <!-- Pulse -->
    <div
      v-else-if="type === 'pulse'"
      :class="[spinnerSizes[size], colorClasses[color]]"
      class="rounded-full animate-pulse bg-current"
    ></div>
  </div>
</template>
