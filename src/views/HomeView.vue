<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen bg-blue-100">
    <div class="relative w-[800px] h-[600px]">
      <CharacterSelectPopup
      v-if="showCharacterSelect"
      :seed="seedLocal"
      :isResetting="isResetting"
      @update:seed="handleSeedInputChangeFromBar"
      @random-seed="handleRandomSeedFromBar"
    />
      <div class="absolute top-3 right-4 z-10 text-4xl pointer-events-none">
        <span v-if="!isNight">☀️</span>
        <span v-else>🌙</span>
      </div>
      <canvas
        ref="terrainCanvas"
        width="800"
        height="600"
        class="max-w-full border border-black border-2 bg-black transition-all absolute top-0 left-0 z-0"
        :class="isNight ? 'brightness-60' : 'brightness-100'"
      ></canvas>
      <canvas
        ref="reactiveCanvas"
        width="800"
        height="600"
        class="max-w-full absolute top-0 left-0 z-10 pointer-events-none"
        :class="isNight ? 'brightness-60' : 'brightness-100'"
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
    <div class="mt-4 flex items-center gap-20 h-6">
      <Transition name="fade-status">
        <StatusBar v-if="!showCharacterSelect"/>
      </Transition>
    </div>
  </div>
</template>



<script setup>
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';
import { useTimeStore } from '../stores/time';
const timeStore = useTimeStore();
const { isNight } = storeToRefs(timeStore);
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
import StatusBar from '../components/StatusBar.vue';
import CharacterSelectPopup from '../components/CharacterSelectPopup.vue';

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
const showCharacterSelect = computed(() => !playerStore.characterSelected);

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

watch(() => playerStore.image, (newImg) => {
  if (newImg) {
    playerImage.value = new Image();
    playerImage.value.src = newImg;
    playerImage.value.onload = () => {
      drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyTerrain: true });
      drawAll(reactiveCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyReactive: true });
    };
  }
});

onMounted(async () => {
  playerImage.value = new Image();
  playerImage.value.src = playerStore.image || 'images/blank.png';
  await new Promise(resolve => {
    playerImage.value.onload = resolve;
  });
  drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { initializePlayer: true, onlyTerrain: true });
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

<style>
.fade-status-enter-active, .fade-status-leave-active {
  transition: opacity 0.5s;
}
.fade-status-enter-from, .fade-status-leave-to {
  opacity: 0;
}
.fade-status-enter-to, .fade-status-leave-from {
  opacity: 1;
}
</style>