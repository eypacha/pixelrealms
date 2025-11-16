


<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-blue-100">
    <div class="mb-4">
      <label for="seed" class="mr-2 font-bold">Seed:</label>
      <input id="seed" v-model="seedInput" type="text" class="border px-2 py-1" @input="updateTerrain" />
      <button @click="randomizeSeed" class="ml-2 px-2 py-1 bg-blue-500 text-white">Random</button>
    </div>
    <div class="relative">
      <canvas ref="terrainCanvas" width="800" height="600" class="border border-black"></canvas>
      <CombatPopup v-if="playerStore.combatActive" />
    </div>
    <div class="mt-4 text-center">
        ❤️ {{ playerStore.health }} &nbsp;
        💪 {{ playerStore.strength }} &nbsp;
        🛡️ {{ playerStore.defense }} &nbsp;
        🪙 {{ playerStore.coins }}
    </div>
  </div>
</template>



<script setup>
import { onMounted, watch, ref } from 'vue';
import { useTerrain } from '../composables/useTerrain';
import { usePlayerStore } from '../stores/player';
import { usePoiStore } from '../stores/poi';
import { drawAll } from '../utilities/draw';
import CombatPopup from '../components/CombatPopup.vue';

const { terrainCanvas, seedInput, randomizeSeed, updateTerrain } = useTerrain();
const playerStore = usePlayerStore();
const poiStore = usePoiStore();
const playerImage = ref(null);

onMounted(async () => {
  playerImage.value = new Image();
  playerImage.value.src = '/images/knight.png';
  await new Promise(resolve => {
    playerImage.value.onload = resolve;
  });
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, { initializePlayer: true });
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (playerStore.combatActive) return;
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
      requestAnimationFrame(() => {
        poiStore.checkDiscovery(playerStore.position, playerStore);
        drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, { redrawTerrain: false });
      });
    }
  });
});

watch(seedInput, () => {
  // Al cambiar la semilla, inicializa el jugador en tierra firme
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, { initializePlayer: true });
});
</script>