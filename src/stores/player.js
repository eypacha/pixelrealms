import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePoiStore } from './poi.js';
import { ref } from 'vue';
import { PLAYER_SPEED, RECOVERY_STEPS } from '../constants/player.js';

import { ENCOUNTER_RATE_DAY, ENCOUNTER_RATE_NIGHT } from '../constants/enemies.js';

import { useTimeStore } from './time.js';

import { createSeededRandom } from '../utilities/randomWithSeed.js';
import { getColorForHeight } from '../utilities/draw.js';
import { useSoundStore } from './sound.js';
import { useCombatStore } from './combat.js';

export const usePlayerStore = defineStore('player', () => {
  const soundStore = useSoundStore();
  const timeStore = useTimeStore();
  const poiStore = usePoiStore();

  // Imágenes de los canvas para Game Over
  const terrainImage = ref(null);
  const reactiveImage = ref(null);

  const seed = ref(Date.now());

  // Player core state
  const position = ref({ x: 0, y: 0 });
  const oldPosition = ref({ x: 0, y: 0 });
  const health = ref(10);
  const maxHealth = ref(10);
  const strength = ref(10);
  const defense = ref(10);
  const coins = ref(10);
  const inventory = ref({ potion: 0 });

  const steps = ref(0);
  const mana = ref(0);

  const gameOver = ref(false);

  const wizardActive = ref(false);
  const lastDirection = ref('down');
  const darkKnightDefeatedCount = ref(0);
  const defeatedEnemiesCount = ref(0);

  // Offset actual del tile
  const currentOffset = ref({ x: 0, y: 0 });

  // terrain helpers
  let terrainRef = null;
  let widthRef = 0;
  let heightRef = 0;
  let encounterRandom = null;

  function initialize(terrain, width, height, randomFn) {
    terrainRef = terrain;
    widthRef = width;
    heightRef = height;
    encounterRandom = createSeededRandom(seed.value + 'encounter');
    let x, y, attempts = 0;
    while (attempts < 1000) {
      x = Math.floor(randomFn() * width);
      y = Math.floor(randomFn() * height);
      // Mapear a la matriz de alturas
      const tx = Math.floor(x * (terrain.length - 1) / (width - 1));
      const ty = Math.floor(y * (terrain.length - 1) / (height - 1));
      if (terrain[ty]?.[tx] > -0.05) {
        position.value = { x, y };
        oldPosition.value = { ...position.value };
        // Revelar POIs cercanos al jugador al iniciar
        poiStore.revealPoi(position.value);
        return;
      }
      attempts++;
    }
    position.value = { x: 0, y: 0 };
    oldPosition.value = { ...position.value };
    poiStore.revealPoi(position.value);
  }

  function reset() {
    health.value = Number.isFinite(maxHealth.value) ? maxHealth.value : 10;
    strength.value = 10;
    defense.value = 10;
    coins.value = 10;
    inventory.value.potion = 2;
    mana.value = 0;
    currentOffset.value = { x: 0, y: 0 };
  }

  function canMoveTo(x, y) {
    if (x < 0 || y < 0 || x >= widthRef || y >= heightRef) return false;
    const tx = Math.floor(x * (terrainRef.length - 1) / (widthRef - 1));
    const ty = Math.floor(y * (terrainRef.length - 1) / (heightRef - 1));
    return terrainRef[ty]?.[tx] > -0.05;
  }

  function moveUp() {
    const { x, y } = position.value;
    if (canMoveTo(x, y - PLAYER_SPEED)) {
      oldPosition.value = { ...position.value };
      position.value.y -= PLAYER_SPEED;
      lastDirection.value = 'up';
      MoveTo(position);
      return true;
    }
    return false;
  }

  function moveDown() {
    const { x, y } = position.value;
    if (canMoveTo(x, y + PLAYER_SPEED)) {
      oldPosition.value = { ...position.value };
      position.value.y += PLAYER_SPEED;
      lastDirection.value = 'down';
      MoveTo(position);
      return true;
    }
    return false;
  }

  function moveLeft() {
    const { x, y } = position.value;
    if (canMoveTo(x - PLAYER_SPEED, y)) {
      oldPosition.value = { ...position.value };
      position.value.x -= PLAYER_SPEED;
      lastDirection.value = 'left';
      MoveTo(position);
      return true;
    }
    return false;
  }

  function moveRight() {
    const { x, y } = position.value;
    if (canMoveTo(x + PLAYER_SPEED, y)) {
      oldPosition.value = { ...position.value };
      position.value.x += PLAYER_SPEED;
      lastDirection.value = 'right';
      MoveTo(position);
      return true;
    }
    return false;
  }

  function MoveTo(pos) {
    steps.value += 1;
    soundStore.playSound('footstep');
    timeStore.registerMove();
    if (steps.value % RECOVERY_STEPS === 0) {
      if (Number.isFinite(health.value) && Number.isFinite(maxHealth.value)) {
        health.value = Math.min(maxHealth.value, health.value + 1);
      } else {
        health.value = 10;
      }
    }
    poiStore.addStepPoi(position.value);
    poiStore.revealPoi(position.value);
    checkEncounter(position.value);
  }

  function getTerrainColor() {
    if (!terrainRef) return '#cccccc';
    const { x, y } = position.value;
    const tx = Math.floor(x * (terrainRef.length - 1) / (widthRef - 1));
    const ty = Math.floor(y * (terrainRef.length - 1) / (heightRef - 1));
    const h = terrainRef[ty]?.[tx] || 0;
    return getColorForHeight(h);
  }

  function checkEncounter(pos) {
    const encounterRate = timeStore.isNight ? ENCOUNTER_RATE_NIGHT : ENCOUNTER_RATE_DAY;
    const roll = encounterRandom();
    if (roll < encounterRate) {
      const combat = useCombatStore();
      combat.startCombat();
    }
  }

  return {
    steps,
    position,
    mana,
    oldPosition,
    seed,
    health,
    maxHealth,
    strength,
    defense,
    coins,
    inventory,
    gameOver,
    wizardActive,
    lastDirection,
    darkKnightDefeatedCount,
    defeatedEnemiesCount,
    currentOffset,
    terrainImage,
    reactiveImage,
    initialize,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    getTerrainColor,
    checkEncounter,
    reset,
  };
});
