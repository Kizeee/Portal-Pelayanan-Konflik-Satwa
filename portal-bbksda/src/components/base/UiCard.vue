<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'elevated',
    validator: (value) => ['elevated', 'outlined', 'filled'].includes(value),
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  padding: {
    type: String,
    default: 'p-6',
  },
})

const cardClasses = computed(() => {
  const base = 'rounded-xl transition-all duration-base'

  const variants = {
    elevated: 'bg-white shadow-card',
    outlined: 'bg-white border-2 border-gray-200',
    filled: 'bg-gray-50',
  }

  const interactive = props.hoverable ? 'card-hover' : ''
  const cursor = props.clickable ? 'cursor-pointer' : ''

  return [base, variants[props.variant], props.padding, interactive, cursor]
    .filter(Boolean)
    .join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <!-- Header Slot -->
    <div v-if="$slots.header" class="mb-4">
      <slot name="header"></slot>
    </div>

    <!-- Body Slot -->
    <div>
      <slot></slot>
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" class="mt-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
