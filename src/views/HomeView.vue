


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
import { usePoiStore } from '../stores/poi';
import { drawAll } from '../utilities/draw';

const { terrainCanvas, seedInput, randomizeSeed, updateTerrain } = useTerrain();
const playerStore = usePlayerStore();
const poiStore = usePoiStore();

onMounted(() => {
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, { initializePlayer: true });
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    let moved = false;
    if (e.key === 'ArrowUp') {
      playerStore.moveUp();
      moved = true;
    } else if (e.key === 'ArrowDown') {
      playerStore.moveDown();
      moved = true;
    } else if (e.key === 'ArrowLeft') {
      playerStore.moveLeft();
      moved = true;
    } else if (e.key === 'ArrowRight') {
      playerStore.moveRight();
      moved = true;
    }
    if (moved) {
      poiStore.checkDiscovery(playerStore.position);
      drawAll(terrainCanvas, seedInput, playerStore, poiStore);
    }
  });
});

watch(seedInput, () => {
  // Al cambiar la semilla, inicializa el jugador en tierra firme
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, { initializePlayer: true });
});
</script>