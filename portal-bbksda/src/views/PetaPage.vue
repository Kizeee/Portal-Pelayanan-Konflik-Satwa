<script setup>
import MapDisplay from '../components/MapDisplay.vue';

defineProps({
  reports: Array,
});
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Peta Sebaran Laporan Konflik</h2>
    <div class="bg-white p-4 rounded-xl shadow-lg">
      <MapDisplay :reports="reports" />
    </div>
  </div>
</template>