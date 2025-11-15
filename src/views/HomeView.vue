


<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-blue-100">
    <div class="mb-4">
      <label for="seed" class="mr-2 font-bold">Semilla:</label>
      <input id="seed" v-model="seedInput" type="text" class="border rounded px-2 py-1" @input="updateTerrain" />
      <button @click="randomizeSeed" class="ml-2 px-2 py-1 bg-blue-500 text-white rounded">Aleatoria</button>
    </div>
    <canvas ref="terrainCanvas" width="800" height="600" class="border border-black rounded shadow-lg"></canvas>
  </div>
</template>



<script setup>
import { onMounted, ref } from 'vue';
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';
import { createSeededRandom } from '../utilities/randomWithSeed';

const terrainCanvas = ref(null);
const terrainSize = 257;
const roughness = 0.7;
const seedInput = ref('12345');

function randomizeSeed() {
  // Genera una semilla aleatoria (entero entre 0 y 99999999)
  seedInput.value = Math.floor(Math.random() * 100000000).toString();
  updateTerrain();
}

function drawTerrain(ctx, width, height, seed) {
  ctx.fillStyle = '#87ceeb';
  ctx.fillRect(0, 0, width, height);

  // Crear función random con semilla
  const seededRandom = createSeededRandom(seed);
  // Generar terreno 2D con random personalizado
  const heights2D = generateMidpointDisplacement2D(terrainSize, roughness, seededRandom);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tx = Math.floor(x * (terrainSize - 1) / (width - 1));
      const ty = Math.floor(y * (terrainSize - 1) / (height - 1));
      const h = heights2D[ty][tx];
      let color = '#228B22';
      if (h < -0.05) color = '#1e90ff';
      else if (h < 0.05) color = '#deb887';
      else if (h > 0.3) color = '#cccccc';
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function updateTerrain() {
  const canvas = terrainCanvas.value;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    drawTerrain(ctx, canvas.width, canvas.height, seedInput.value);
  }
}

onMounted(() => {
  updateTerrain();
});
</script>