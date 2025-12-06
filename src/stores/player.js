import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePoiStore } from './poi.js';
import { ref, computed } from 'vue';
import { PLAYER_SPEED, RECOVERY_STEPS, WEAPON_ICONS } from '../constants/player.js';

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

  // Character selection state
  const characterSelected = ref(false);
  const character = ref(null);
  const image = ref(null);
  const weaponType = ref('sword');
  const weaponIcon = computed(() => WEAPON_ICONS[weaponType.value] || '🗡️');

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
  const runCount = ref(0); // Contador de intentos roguelike
  const isRetrying = ref(false); // Bandera para evitar guardar durante el retry

  const wizardActive = ref(false);
  const lastDirection = ref('down');
  const darkKnightDefeatedCount = ref(0);
  const defeatedEnemiesCount = ref(0);

  // Offset actual del tile
  const currentOffset = ref({ x: 0, y: 0 });

  // Variables para guardar la posición inicial del spawn (solo se guarda una vez, para roguelike retry)
  const initialPosition = ref({ x: 0, y: 0 });
  const initialPositionSet = ref(false);

  // terrain helpers
  let terrainRef = null;
  let widthRef = 0;
  let heightRef = 0;
  let encounterRandom = null;

  function initialize(terrain, width, height, randomFn, worldOffset = { x: 0, y: 0 }) {
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
        // Guardar posición inicial solo la primera vez (para roguelike retry)
        if (!initialPositionSet.value) {
          initialPosition.value = { x, y };
          initialPositionSet.value = true;
          console.log('📍 initialPosition guardada:', initialPosition.value);
        }
        // Establecer campfire en la posición de spawn (persiste entre runs)
        poiStore.setCampfire(position.value, worldOffset.x || 0, worldOffset.y || 0);
        // Revelar POIs cercanos al jugador al iniciar
        poiStore.revealPoi(position.value);
        return;
      }
      attempts++;
    }
    position.value = { x: 0, y: 0 };
    oldPosition.value = { ...position.value };
    poiStore.setCampfire(position.value, worldOffset.x || 0, worldOffset.y || 0);
    poiStore.revealPoi(position.value);
  }

  // Configura el terreno sin reinicializar la posición del jugador (para estados cargados)
  function setTerrain(terrain, width, height) {
    console.log('🗺️ setTerrain - Posición actual (NO debe cambiar):', position.value.x, position.value.y);
    terrainRef = terrain;
    widthRef = width;
    heightRef = height;
    encounterRandom = createSeededRandom(seed.value + 'encounter');
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

  // Función para reiniciar el run (roguelike)
  function retryRun() {
    // Marcar que estamos en proceso de retry para evitar guardar estado intermedio
    isRetrying.value = true;
    
    // Resetear el estado del combate por si acaso quedó en estado inconsistente
    const combatStore = useCombatStore();
    combatStore.resetCombat();
    
    // Resetear el ciclo de tiempo (día/noche)
    timeStore.resetTime();
    
    runCount.value += 1;
    
    // Resetear stats con bonus por cada run
    const baseStrength = character.value?.stats?.strength || 10;
    const baseDefense = character.value?.stats?.defense || 10;
    const baseHealth = character.value?.stats?.health || 10;
    const baseCoins = character.value?.stats?.coins || 10;
    const basePotions = character.value?.stats?.potion || 2;
    const baseMana = character.value?.stats?.mana || 0;
    
    // Aplicar bonus roguelike: +1 str y +1 def por cada run previo
    strength.value = baseStrength + runCount.value;
    defense.value = baseDefense + runCount.value;
    health.value = baseHealth;
    maxHealth.value = baseHealth;
    coins.value = baseCoins;
    inventory.value.potion = basePotions;
    mana.value = baseMana;
    
    // Volver a la posición inicial
    console.log('🔄 retryRun - initialPosition:', initialPosition.value);
    position.value = { ...initialPosition.value };
    oldPosition.value = { ...initialPosition.value };
    currentOffset.value = { x: 0, y: 0 };
    
    // Resetear contadores
    steps.value = 0;
    darkKnightDefeatedCount.value = 0;
    defeatedEnemiesCount.value = 0;
    
    // Resetear dirección del jugador
    lastDirection.value = 'down';
    
    // Limpiar imágenes capturadas del game over anterior
    terrainImage.value = null;
    reactiveImage.value = null;
    
    // Desactivar wizardActive primero
    wizardActive.value = false;
    
    // IMPORTANTE: gameOver se desactiva AL FINAL para que los watchers
    // no guarden el estado intermedio antes de que los POIs se reseteen
    // Los POIs se resetean desde HomeView cuando detecta el cambio de gameOver
    gameOver.value = false;
  }
  
  // Función para marcar que el retry ha terminado (llamar desde HomeView después de resetear POIs)
  function finishRetry() {
    isRetrying.value = false;
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
      // pass minimal player info (defeatedEnemiesCount) so combat store can filter available enemies
      combat.startCombat(undefined, { defeatedEnemiesCount: defeatedEnemiesCount.value });
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
    runCount,
    initialPosition,
    wizardActive,
    lastDirection,
    darkKnightDefeatedCount,
    defeatedEnemiesCount,
    currentOffset,
    terrainImage,
    reactiveImage,
    characterSelected,
    character,
    image,
    weaponType,
    weaponIcon,
    isRetrying,
    initialize,
    setTerrain,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    getTerrainColor,
    checkEncounter,
    reset,
    retryRun,
    finishRetry,
  };
});
