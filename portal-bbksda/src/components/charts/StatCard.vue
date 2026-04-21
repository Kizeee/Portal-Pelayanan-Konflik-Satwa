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
    <!-- Decorative blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <!-- Icon circle -->
    <div class="icon-wrap">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
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

    <!-- Bottom bar accent -->
    <div class="bottom-bar"></div>
  </div>
</template>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 1.5rem 1.25rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: default;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

/* Gradient presets applied via the gradient prop from parent */
/* Fallback: if no gradient class is provided, color prop is used */

/* Decorative blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  pointer-events: none;
}
.blob-1 {
  width: 110px;
  height: 110px;
  top: -30px;
  right: -30px;
}
.blob-2 {
  width: 70px;
  height: 70px;
  bottom: -20px;
  left: -10px;
  background: rgba(255, 255, 255, 0.08);
}

/* Icon */
.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

/* Stat content */
.stat-content {
  z-index: 1;
}

.stat-value {
  font-size: 2.4rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.stat-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  margin-top: 0.3rem;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* Bottom accent bar */
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0 0 20px 20px;
}
</style>