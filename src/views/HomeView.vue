<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-blue-100">
    <div class="mb-4 flex gap-2 items-center">
      <label for="seed" class="mr-2 font-bold">Seed:</label>
      <input id="seed" v-model="seedInput" type="text" class="border px-2 py-1" />
      <button
        @click="resetGameWithRandomSeed"
        class="ml-2 px-2 py-1 bg-blue-500 text-white"
        :disabled="isResetting"
        :class="isResetting ? 'opacity-50 pointer-events-none' : ''"
      >
        Nueva semilla
      </button>
    </div>
    <div class="relative w-[800px] h-[600px]">
      <div class="absolute top-3 right-4 z-10 text-4xl pointer-events-none">
        <span v-if="!timeStore.isNight.value">☀️</span>
        <span v-else>🌙</span>
      </div>
      <canvas
        ref="terrainCanvas"
        width="800"
        height="600"
        class="max-w-full border border-black border-2 bg-black transition-all absolute top-0 left-0 z-0"
        :class="timeStore.isNight.value ? 'brightness-60' : 'brightness-100'"
      ></canvas>
      <canvas
        ref="reactiveCanvas"
        width="800"
        height="600"
        class="max-w-full absolute top-0 left-0 z-10 pointer-events-none"
        :class="timeStore.isNight.value ? 'brightness-60' : 'brightness-100'"
      ></canvas>
      <CombatPopup v-if="playerStore.combatActive" />
      <GameOverPopup v-if="playerStore.gameOver" />
      <WizardPopup v-if="playerStore.wizardActive" />
      <NarrativePopup
        v-if="narrativeActive"
        :anecdote-index="currentAnecdote.index"
        :anecdote-lang="currentAnecdote.lang"
        :visible="narrativeActive"
        @close="closeNarrative"
      />
      <TreasurePopup v-if="treasureDiscovered" />
    </div>
    <div class="mt-4 flex items-center gap-20">
      <div>
        ❤️ {{ playerStore.health }}
        🗡️ {{ playerStore.strength }}
        🛡️ {{ playerStore.defense }}
        🪙 {{ playerStore.coins }}
        🧪 {{ playerStore.inventory.potion }}
        🪬 {{ playerStore.mana }}
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label for="volume" class="mr-2 font-bold">
            <span v-if="Number(soundStore.volume) === 0">🔇</span>
            <span v-else>🔊</span>
          </label>
          <input id="volume" type="range" min="0" max="1" step="0.01" class="w-25" v-model="soundStore.volume" @input="soundStore.setVolume(Number(soundStore.volume))"/>
        </div>
        <div class="flex items-center gap-2">
          <select id="lang" v-model="$i18n.locale" class="border px-2 py-1">
            <option value="es">{{ $t('hud.spanish') }}</option>
            <option value="en">{{ $t('hud.english') }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';
import { useTimeStore } from '../stores/time';
const timeStore = useTimeStore();
import { useSoundStore } from '../stores/sound';
const soundStore = useSoundStore();
import { onMounted, watch, ref } from 'vue';
import { useTerrain } from '../composables/useTerrain';
import { usePlayerStore } from '../stores/player';
import { usePoiStore } from '../stores/poi';
import { drawAll } from '../utilities/draw';
import { PLAYER_SPEED } from '../constants/player';
import CombatPopup from '../components/CombatPopup.vue';
import GameOverPopup from '../components/GameOverPopup.vue';
import WizardPopup from '../components/WizardPopup.vue';
import NarrativePopup from '../components/NarrativePopup.vue';
import { useNarrativeEncounter } from '../composables/useNarrativeEncounter';
import TreasurePopup from '../components/TreasurePopup.vue';
import { storeToRefs } from 'pinia';

const { terrainCanvas, seedInput, worldOffset, addOffset, tileStep, randomizeSeed } = useTerrain();
const reactiveCanvas = ref(null);
const playerStore = usePlayerStore();
const poiStore = usePoiStore();
const { treasureDiscovered } = storeToRefs(poiStore);
const playerImage = ref(null);

const narrativeActive = ref(false);
const currentAnecdote = ref({ index: null, lang: 'en' });
const { maybeTriggerEncounter } = useNarrativeEncounter();
const isResetting = ref(false);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function resetGameWithRandomSeed() {
  isResetting.value = true;
  await sleep(300); // Espera 300ms para mostrar el botón deshabilitado
  isResetting.value = false;

  randomizeSeed();
  // Resetear jugador y POIs
  playerStore.health = playerStore.maxHealth;
  playerStore.strength = 10;
  playerStore.defense = 5;
  playerStore.coins = 0;
  playerStore.inventory.potion = 1;
  playerStore.mana = 0;
  playerStore.combatActive = false;
  playerStore.gameOver = false;
  playerStore.wizardActive = false;
  playerStore.enemyHealth = 10;
  playerStore.enemyStrength = 5;
  playerStore.enemyDefense = 2;
  playerStore.enemyType = 'goblin';
  playerStore.playerTurn = true;
  playerStore.coverActive = false;
  playerStore.enemyDefeated = false;
  playerStore.lootCollected = false;
  playerStore.lastDirection = 'right';
  playerStore.darkKnightDefeatedCount = 0;
  playerStore.currentOffset = { x: 0, y: 0 };
  if (poiStore.pois && typeof poiStore.pois.value !== 'undefined') poiStore.pois.value = [];
  if (poiStore.treasureDiscovered && typeof poiStore.treasureDiscovered.value !== 'undefined') poiStore.treasureDiscovered.value = false;
  // Regenerar POIs solo para el tile actual, usando caché si existe
  let terrain = null;
  if (terrainCanvas.value) {
    terrain = generateMidpointDisplacement2D(257, 0.7, worldOffset.value.x, worldOffset.value.y, seedInput.value);
  }
  if (typeof poiStore.resetPois === 'function') {
    poiStore.resetPois(worldOffset.value.x, worldOffset.value.y, terrain, 800, 600, seedInput.value);
  }
  if (typeof poiStore.ensureForTile === 'function') {
    poiStore.ensureForTile(worldOffset.value.x, worldOffset.value.y, terrain, 800, 600, seedInput.value);
  }
  // Dibuja solo el terreno en el canvas de fondo
  drawAll(terrainCanvas, seedInput, null, null, null, worldOffset.value, { onlyTerrain: true });
  // Dibuja los elementos reactivos en el canvas superior
  drawAll(reactiveCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyReactive: true });

}

function closeNarrative() {
  narrativeActive.value = false;
  currentAnecdote.value = { index: null, lang: 'en' };
}

onMounted(async () => {
  playerImage.value = new Image();
  playerImage.value.src = 'images/knight.png';
  await new Promise(resolve => {
    playerImage.value.onload = resolve;
  });
  // Dibuja solo el terreno en el canvas de fondo
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { initializePlayer: true, onlyTerrain: true });
  // Dibuja los elementos reactivos en el canvas superior
  drawAll(reactiveCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyReactive: true });
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (playerStore.combatActive) return;
    if (narrativeActive.value) return;
    let moved = false;
      if (e.key === 'ArrowUp') {
      soundStore.playSound('footstep');
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
      soundStore.playSound('footstep');
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
      soundStore.playSound('footstep');
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
      soundStore.playSound('footstep');
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
      // Si se movió a otro tile, asegúrate de regenerar/recuperar los POIs del tile actual
      let terrain = null;
      if (terrainCanvas.value) {
        terrain = generateMidpointDisplacement2D(257, 0.7, worldOffset.value.x, worldOffset.value.y, seedInput.value);
      }
      if (typeof poiStore.ensureForTile === 'function') {
        poiStore.ensureForTile(worldOffset.value.x, worldOffset.value.y, terrain, 800, 600, seedInput.value);
      }
      timeStore.registerMove();
      requestAnimationFrame(() => {
        poiStore.checkDiscovery(playerStore.position, playerStore);
        drawAll(reactiveCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyReactive: true });
        const result = maybeTriggerEncounter();
        if (result && typeof result.index === 'number') {
          currentAnecdote.value = result;
          narrativeActive.value = true;
          poiStore.addNarrativePoi({
            x: playerStore.position.x,
            y: playerStore.position.y,
            offsetX: worldOffset.value.x,
            offsetY: worldOffset.value.y
          }, result);
        }
        if (Array.isArray(poiStore.pois.value)) {
          poiStore.pois.value.forEach(poi => {
            if (poi.type === 'narrative' && Math.abs(poi.position.x - playerStore.position.x) < 10 && Math.abs(poi.position.y - playerStore.position.y) < 10) {
              currentAnecdote.value = poi.narrativeData;
              narrativeActive.value = true;
            }
          });
        }
      });
    }
  });
});

watch(seedInput, () => {
  // Al cambiar la semilla, inicializa el jugador y los POIs con el terreno
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { initializePlayer: true, onlyTerrain: true });
  drawAll(reactiveCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyReactive: true });
});
</script>