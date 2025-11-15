

<template>
  <div class="flex items-center justify-center min-h-screen bg-blue-100">
    <canvas ref="terrainCanvas" width="800" height="600" class="border border-black rounded shadow-lg"></canvas>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue';
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';

const terrainCanvas = ref(null);

const terrainSize = 257; // Menor para renderizar rápido en 2D
const roughness = 0.7;

function drawTerrain(ctx, width, height) {
  // Fondo celeste
  ctx.fillStyle = '#87ceeb';
  ctx.fillRect(0, 0, width, height);

  // Generar terreno 2D
  const heights2D = generateMidpointDisplacement2D(terrainSize, roughness);
  // Renderizar como mapa de alturas
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tx = Math.floor(x * (terrainSize - 1) / (width - 1));
      const ty = Math.floor(y * (terrainSize - 1) / (height - 1));
      const h = heights2D[ty][tx];
      // Colores según altura
      let color = '#228B22'; // Verde
      if (h < -0.05) color = '#1e90ff'; // Mar
      else if (h < 0.05) color = '#deb887'; // Playa
      else if (h > 0.3) color = '#cccccc'; // Montaña
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

onMounted(() => {
  const canvas = terrainCanvas.value;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    drawTerrain(ctx, canvas.width, canvas.height);
  }
});
</script>