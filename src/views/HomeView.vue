<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-blue-100">
    <!-- <div class="mb-4">
      <label for="seed" class="mr-2 font-bold">Seed:</label>
      <input id="seed" v-model="seedInput" type="text" class="border px-2 py-1" @input="updateTerrain" />
      <button @click="randomizeSeed" class="ml-2 px-2 py-1 bg-blue-500 text-white">Random</button>
    </div> -->
    <div class="relative">
      <canvas ref="terrainCanvas" width="800" height="600" class="border border-black"></canvas>
      <CombatPopup v-if="playerStore.combatActive" />
      <GameOverPopup v-if="playerStore.gameOver" />
      <WizardPopup v-if="playerStore.wizardActive" />
    </div>
    <div class="mt-4 text-center">
        ❤️ {{ playerStore.health }}
        🗡️ {{ playerStore.strength }}
        🛡️ {{ playerStore.defense }}
        🪙 {{ playerStore.coins }}
        🧪 {{ playerStore.inventory.potion }}
    </div>
    <div class="text-center">
    </div>
  </div>
</template>



<script setup>
import { onMounted, watch, ref } from 'vue';
import { useTerrain } from '../composables/useTerrain';
import { usePlayerStore } from '../stores/player';
import { usePoiStore } from '../stores/poi';
import { drawAll } from '../utilities/draw';
import { PLAYER_SPEED } from '../constants/player';
import CombatPopup from '../components/CombatPopup.vue';
import GameOverPopup from '../components/GameOverPopup.vue';
import WizardPopup from '../components/WizardPopup.vue';

const { terrainCanvas, seedInput, randomizeSeed, updateTerrain, worldOffset, addOffset, tileStep } = useTerrain();
const playerStore = usePlayerStore();
const poiStore = usePoiStore();
const playerImage = ref(null);

onMounted(async () => {
  playerImage.value = new Image();
  playerImage.value.src = 'images/knight.png';
  await new Promise(resolve => {
    playerImage.value.onload = resolve;
  });
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { initializePlayer: true });
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (playerStore.combatActive) return;
    let moved = false;
      if (e.key === 'ArrowUp') {
      moved = playerStore.moveUp();
      if (!moved) {
        const canvas = terrainCanvas.value;
        // si estaba lo suficientemente cerca del borde superior, hacer wrap hacia el tile de arriba
        if (playerStore.position.y <= PLAYER_SPEED) {
          addOffset(0, -tileStep);
          playerStore.position.y = canvas.height - 1;
          moved = true;
        }
      }
    } else if (e.key === 'ArrowDown') {
      moved = playerStore.moveDown();
      if (!moved) {
        const canvas = terrainCanvas.value;
        if (playerStore.position.y >= canvas.height - PLAYER_SPEED) {
          addOffset(0, tileStep);
          playerStore.position.y = 0;
          moved = true;
        }
      }
    } else if (e.key === 'ArrowLeft') {
      moved = playerStore.moveLeft();
      if (!moved) {
        const canvas = terrainCanvas.value;
        if (playerStore.position.x <= PLAYER_SPEED) {
          addOffset(-tileStep, 0);
          playerStore.position.x = canvas.width - 1;
          moved = true;
        }
      }
    } else if (e.key === 'ArrowRight') {
      moved = playerStore.moveRight();
      if (!moved) {
        const canvas = terrainCanvas.value;
        if (playerStore.position.x >= canvas.width - PLAYER_SPEED) {
          addOffset(tileStep, 0);
          playerStore.position.x = 0;
          moved = true;
        }
      }
    }
    if (moved) {
      requestAnimationFrame(() => {
        poiStore.checkDiscovery(playerStore.position, playerStore);
        // redrawTerrain true when we wrapped (worldOffset changed), else false to only repaint player
        drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { redrawTerrain: true });
      });
    }
  });
});

watch(seedInput, () => {
  // Al cambiar la semilla, inicializa el jugador en tierra firme
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { initializePlayer: true });
});
</script>