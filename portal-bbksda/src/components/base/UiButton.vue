<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger', 'outline'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: null,
  },
  iconRight: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
})

const buttonClasses = computed(() => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-base focus-ring disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-md active:scale-95',
    secondary:
      'bg-gradient-to-r from-secondary-400 to-secondary-500 text-gray-900 hover:from-secondary-500 hover:to-secondary-600 hover:shadow-md active:scale-95',
    ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
    danger:
      'bg-gradient-to-r from-error to-error-dark text-white hover:shadow-md active:scale-95',
    outline:
      'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2.5 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12',
  }

  const width = props.block ? 'w-full' : ''

  return [base, variants[props.variant], sizes[props.size], width].filter(Boolean).join(' ')
})
</script>

<template>
  <button :class="buttonClasses" :disabled="disabled || loading" :type="type">
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
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

    <!-- Left Icon -->
    <slot name="icon-left" v-if="!iconRight && !loading">
      <span v-if="icon" class="mr-2" v-html="icon"></span>
    </slot>

    <!-- Default Slot -->
    <slot></slot>

    <!-- Right Icon -->
    <slot name="icon-right" v-if="iconRight && !loading">
      <span v-if="icon" class="ml-2" v-html="icon"></span>
    </slot>
  </button>
</template>
