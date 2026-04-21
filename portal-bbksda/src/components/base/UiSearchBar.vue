<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Search...',
  },
  debounce: {
    type: Number,
    default: 300,
  },
  resultCount: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'search'])

const localValue = ref(props.modelValue)
let debounceTimeout = null

watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = newVal
  },
)

watch(localValue, (newVal) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    emit('update:modelValue', newVal)
    emit('search', newVal)
  }, props.debounce)
})

const handleClear = () => {
  localValue.value = ''
}
</script>

<template>
  <div class="relative">
    <!-- Search Icon -->
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg
        class="h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <!-- Input -->
    <input
      v-model="localValue"
      type="text"
      :placeholder="placeholder"
      class="input-base pl-10 pr-10"
    />

    <!-- Clear Button -->
    <button
      v-if="localValue"
      @click="handleClear"
      type="button"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Result Count -->
    <p v-if="resultCount !== null" class="mt-2 text-sm text-gray-600">
      Found <span class="font-semibold text-primary-600">{{ resultCount }}</span> result{{
        resultCount !== 1 ? 's' : ''
      }}
    </p>
  </div>
</template>
