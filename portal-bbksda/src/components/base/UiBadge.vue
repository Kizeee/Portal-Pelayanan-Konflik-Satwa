<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: '',
    validator: (value) =>
      ['Diterima', 'Selesai', 'Ditolak', 'Tidak Valid', 'Menunggu Verifikasi', 'pending', 'verified', 'Tim Menuju Lokasi', 'Penanganan di Lokasi', 'Diproses', 'info', 'success', 'warning', 'error', ''].includes(value),
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'dot', 'outlined'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  dot: {
    type: Boolean,
    default: false,
  },
})

const badgeClasses = computed(() => {
  const statusColors = {
    Diterima: 'bg-info-light text-info-dark',
    'Penanganan di Lokasi': 'bg-warning-light text-warning-dark',
    Diproses: 'bg-warning-light text-warning-dark',
    Ditolak: 'bg-error-light text-error-dark',
    'Tidak Valid': 'bg-error-light text-error-dark',
    'Menunggu Verifikasi': 'bg-warning-light text-warning-dark',
    pending: 'bg-warning-light text-warning-dark',
    verified: 'bg-success-light text-success-dark',
    'Tim Menuju Lokasi': 'bg-success-light text-success-dark',
    info: 'bg-info-light text-info-dark',
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    error: 'bg-error-light text-error-dark',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const base = 'inline-flex items-center font-semibold rounded-full capitalize'
  const color = statusColors[props.status] || 'bg-gray-100 text-gray-800'

  return [base, color, sizes[props.size]].filter(Boolean).join(' ')
})
</script>

<template>
  <span :class="badgeClasses">
    <!-- Dot Indicator -->
    <span
      v-if="dot"
      class="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse"
      :class="{
        'bg-info-dark': status === 'Diterima' || status === 'info',
        'bg-warning-dark': status === 'Penanganan di Lokasi' || status === 'Diproses' || status === 'warning' || status === 'Menunggu Verifikasi' || status === 'pending',
        'bg-success-dark': status === 'Selesai' || status === 'success' || status === 'verified' || status === 'Tim Menuju Lokasi',
        'bg-error-dark': status === 'Ditolak' || status === 'Tidak Valid' || status === 'error',
      }"
    ></span>

    <!-- Content -->
    <slot>{{ status }}</slot>
  </span>
</template>
