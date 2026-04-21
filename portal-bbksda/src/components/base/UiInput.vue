<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  helperText: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: null,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'clear'])

const inputRef = ref(null)

const inputClasses = computed(() => {
  const base = 'input-base'
  const states = props.error ? 'input-error' : ''
  const padding = props.icon ? 'pl-10' : ''

  return [base, states, padding].filter(Boolean).join(' ')
})

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-semibold text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>

    <!-- Input Wrapper -->
    <div class="relative">
      <!-- Left Icon -->
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-400" v-html="icon"></span>
      </div>

      <!-- Input -->
      <input
        ref="inputRef"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        :required="required"
      />

      <!-- Clear Button -->
      <button
        v-if="clearable && modelValue"
        @click="handleClear"
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Helper Text or Error -->
    <p v-if="error" class="mt-1.5 text-sm text-error">
      {{ error }}
    </p>
    <p v-else-if="helperText" class="mt-1.5 text-sm text-gray-500">
      {{ helperText }}
    </p>
  </div>
</template>
