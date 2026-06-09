<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  title: String,
  value: Number,
  icon: String,
  color: String,
  gradient: String,
  iconPath: String,
})

// Animated counter
const displayValue = ref(0)

function animateCounter(target) {
  const duration = 800
  const start = displayValue.value
  const diff = target - start
  const startTime = performance.now()

  function step(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    displayValue.value = Math.round(start + diff * eased)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

onMounted(() => animateCounter(props.value ?? 0))
watch(() => props.value, (val) => animateCounter(val ?? 0))
</script>

<template>
  <div class="stat-card" :class="gradient || color">
    <div class="icon-wrap" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath || icon || 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'" />
      </svg>
    </div>

    <div class="stat-content">
      <p class="stat-title">{{ title }}</p>
      <p class="stat-value">{{ displayValue }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  position: relative;
  border-radius: 8px;
  padding: 1rem 1.05rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  cursor: default;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-top: 3px solid #4b5563;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  flex-shrink: 0;
}

.stat-content {
  min-width: 0;
}

.stat-value {
  margin-top: 0.15rem;
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
  letter-spacing: 0;
}

.stat-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #4b5563;
  letter-spacing: 0;
}

.stat-gradient-green {
}

.stat-gradient-yellow {
}

.stat-gradient-teal {
}

.stat-gradient-blue {
}

.stat-gradient-red {
}
</style>
