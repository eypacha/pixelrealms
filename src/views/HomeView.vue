<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-blue-100">
    <TopBar
      :seed="seedLocal"
      :isResetting="isResetting"
      @update:seed="handleSeedInputChangeFromBar"
      @random-seed="handleRandomSeedFromBar"
    />
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
      <StatusBar />
      <SettingsBar />
    </div>
  </div>
</template>



<script setup>
import TopBar from '../components/TopBar.vue';
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';
import { useTimeStore } from '../stores/time';
const timeStore = useTimeStore();
import { useSoundStore } from '../stores/sound';
const soundStore = useSoundStore();
import { onMounted, watch, ref, computed } from 'vue';
import { useTerrain } from '../composables/useTerrain';
import { usePlayerMovement } from '../composables/usePlayerMovement';
import { usePlayerStore } from '../stores/player';
import { usePoiStore } from '../stores/poi';
import { drawAll } from '../utilities/draw';
import CombatPopup from '../components/CombatPopup.vue';
import GameOverPopup from '../components/GameOverPopup.vue';
import WizardPopup from '../components/WizardPopup.vue';
import NarrativePopup from '../components/NarrativePopup.vue';
import { useNarrativeEncounter } from '../composables/useNarrativeEncounter';
import TreasurePopup from '../components/TreasurePopup.vue';
import { storeToRefs } from 'pinia';
import SettingsBar from '../components/SettingsBar.vue';
import StatusBar from '../components/StatusBar.vue';

const { terrainCanvas, seedInput, worldOffset, addOffset, tileStep, randomizeSeed } = useTerrain();
const seedLocal = ref(seedInput.value);
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

async function resetGame(seed) {
  playerStore.reset();
  let terrain = generateMidpointDisplacement2D(257, 0.7, worldOffset.value.x, worldOffset.value.y, seed);
  poiStore.resetPois(worldOffset.value.x, worldOffset.value.y, terrain, 800, 600, seed);
  drawAll(terrainCanvas, seedInput, null, null, null, worldOffset.value, { onlyTerrain: true });
  drawAll(reactiveCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyReactive: true });
}

function handleRandomSeedFromBar() {
  randomizeSeed();
  seedLocal.value = seedInput.value;
  resetGame(seedInput.value);
}

function handleSeedInputChangeFromBar(newSeed) {
  seedLocal.value = newSeed;
  seedInput.value = newSeed;
  resetGame(newSeed);
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
});

usePlayerMovement({
  playerStore,
  terrainCanvas,
  reactiveCanvas,
  seedInput,
  worldOffset,
  tileStep,
  addOffset,
  soundStore,
  poiStore,
  playerImage,
  timeStore,
  drawAll,
  maybeTriggerEncounter,
  currentAnecdote,
  narrativeActive
});

watch(seedInput, () => {
  // Al cambiar la semilla, inicializa el jugador y los POIs con el terreno
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { initializePlayer: true, onlyTerrain: true });
  drawAll(reactiveCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyReactive: true });
});
</script>