


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
import { onMounted, watch } from 'vue';
import { useTerrain } from '../composables/useTerrain';
import { usePlayerStore } from '../stores/player';
import { createSeededRandom } from '../utilities/randomWithSeed';
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';

const { terrainCanvas, seedInput, randomizeSeed, updateTerrain } = useTerrain();
const playerStore = usePlayerStore();

function drawPlayer(ctx, position) {
  console.log('Dibujando jugador en:', position);
  // Dibujar borde negro
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.strokeRect(position.x - 1, position.y - 1, 8, 8);
  // Dibujar cuadrado rojo
  ctx.fillStyle = 'red';
  ctx.fillRect(position.x, position.y, 6, 6);
}

function drawAll() {
  const canvas = terrainCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // Redibujar terreno
  const terrainSize = 257;
  const roughness = 0.7;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Generar terreno y matriz de alturas
  const seededRandom = createSeededRandom(seedInput.value);
  const heights2D = generateMidpointDisplacement2D(terrainSize, roughness, seededRandom);
  // Inicializar SIEMPRE el jugador en tierra firme
  playerStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
  console.log('Posición inicial jugador:', playerStore.position);
  // Pintar terreno
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const tx = Math.floor(x * (terrainSize - 1) / (canvas.width - 1));
      const ty = Math.floor(y * (terrainSize - 1) / (canvas.height - 1));
      const h = heights2D[ty][tx];
      let color = '#228B22';
      if (h < -0.05) color = '#1e90ff';
      else if (h < 0.05) color = '#deb887';
      else if (h > 0.3) color = '#cccccc';
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Dibujar jugador
  drawPlayer(ctx, playerStore.position);
}

onMounted(() => {
  drawAll();
});

watch(seedInput, () => {
  // Al cambiar la semilla, inicializa el jugador en tierra firme
  drawAll();
});
</script>