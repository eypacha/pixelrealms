

<template>
  <div class="flex items-center justify-center min-h-screen bg-blue-100">
    <canvas ref="terrainCanvas" width="800" height="600" class="border border-black rounded shadow-lg"></canvas>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue';

const terrainCanvas = ref(null);

onMounted(() => {
  const canvas = terrainCanvas.value;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#87ceeb'; // Celeste
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
});
</script>