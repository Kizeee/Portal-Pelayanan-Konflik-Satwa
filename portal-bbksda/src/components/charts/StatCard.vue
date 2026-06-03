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
    <!-- Icon circle -->
    <div class="icon-wrap">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath || icon || 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'" />
      </svg>
    </div>

    <!-- Content -->
    <div class="stat-content">
      <p class="stat-value">{{ displayValue }}</p>
      <p class="stat-title">{{ title }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 1.25rem 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: default;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Icon */
.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: currentColor;
  opacity: 0.12;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-wrap svg {
  position: absolute;
  color: inherit;
  opacity: 1;
}

/* Fix icon visibility */
.stat-card .icon-wrap {
  background: transparent;
}

.stat-card .icon-wrap::before {
  content: '';
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0.15;
  border-radius: 10px;
}

.stat-card .icon-wrap svg {
  position: relative;
  z-index: 1;
}

/* Stat content */
.stat-content {
  z-index: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.5px;
}

.stat-title {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.7;
  margin-top: 0.25rem;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}
</style>
