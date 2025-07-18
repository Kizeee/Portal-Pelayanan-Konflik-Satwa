<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  }
});

const chartCanvas = ref(null);
let chartInstance = null;

const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: props.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0, // Tampilkan angka bulat di sumbu Y
            }
          },
          x: {
            grid: {
              display: false,
            }
          }
        }
      }
    });
  }
};

onMounted(() => {
  renderChart();
});

watch(() => props.chartData, () => {
  renderChart();
}, { deep: true });
</script>

<template>
  <div class="relative h-80">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>