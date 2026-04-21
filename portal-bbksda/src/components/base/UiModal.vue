<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'update:show'])

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleBackdropClick = () => {
  if (props.closeOnClickOutside) {
    handleClose()
  }
}

const handleEscape = (e) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        @click="handleBackdropClick"
        @keydown="handleEscape"
        class="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        tabindex="-1"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-300"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            @click.stop
            :class="[modalSizes[size]]"
            class="bg-white rounded-2xl shadow-modal w-full animate-slide-up"
          >
            <!-- Header -->
            <div
              v-if="title || $slots.header"
              class="flex items-center justify-between p-6 border-b border-gray-200"
            >
              <slot name="header">
                <h3 class="text-2xl font-bold text-gray-900">{{ title }}</h3>
              </slot>

              <button
                @click="handleClose"
                class="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
