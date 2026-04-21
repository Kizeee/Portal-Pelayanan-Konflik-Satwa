<script setup>
import { useReportsStore } from '../stores/reports'
import MapDisplay from '../components/MapDisplay.vue'

const reportsStore = useReportsStore()
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6 text-brand-green">Peta Sebaran Konflik Satwa</h2>
    <MapDisplay :reports="reportsStore.reportsWithCoords" />
  </div>
</template>