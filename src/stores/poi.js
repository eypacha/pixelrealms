
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DARK_KNIGHT_COUNT, LOOT_MIN, LOOT_MAX, TREASURE_COUNT, WIZARD_COUNT } from '../constants/poi.js';
import { createSeededRandom } from '../utilities/randomWithSeed.js';
import { useTerrain } from '../composables/useTerrain.js';

export const usePoiStore = defineStore('poi', () => {
  // Instancia de useTerrain para acceso a isValidTerrain
  const terrainUtils = useTerrain();
  // Array de enemigos derrotados: { type, x, y, offsetX, offsetY }
  const defeatedEnemies = ref([]);
  // Mapa de POIs por tile key 'offsetX,offsetY'
  const poisByTile = ref({});
  const pois = ref([]); // current tile pois

  // Reactive property for treasure popup
  const treasureDiscovered = ref(false);

  // Limpia todos los POIs de todos los tiles y genera los del tile actual
  function resetPois(offsetX, offsetY, terrain, width, height, seed, count = DARK_KNIGHT_COUNT) {
    poisByTile.value = {};
    pois.value = [];
    defeatedEnemies.value = [];
    ensureForTile(offsetX, offsetY, terrain, width, height, seed, count);
  }

  // Generate POIs for a specific tile defined by offsetX, offsetY (in grid indices)
  // Now generates 'darkKnight', 'wizard' and 'treasure' POIs
  function ensureForTile(offsetX, offsetY, terrain, width, height, seed, count = DARK_KNIGHT_COUNT) {
    const key = `${offsetX},${offsetY}`;
    if (poisByTile.value[key]) {
      pois.value = poisByTile.value[key];
      return;
    }
    const rand = createSeededRandom(String(seed) + ':poi:' + key);
    const arr = [];
    
    // Dark Knights
    for (let i = 0; i < count; i++) {
      let x, y, attempts = 0;
      let placed = false;
      while (attempts < 1000 && !placed) {
        x = Math.floor(rand() * width);
        y = Math.floor(rand() * height);
        if (terrainUtils.isValidTerrain(x, y, width, height, terrain)) {
          const loot = Math.floor(rand() * (LOOT_MAX - LOOT_MIN + 1)) + LOOT_MIN;
          arr.push({ id: 'darkKnight-' + i, type: 'darkKnight', position: { x, y }, discovered: false, loot });
          placed = true;
        }
        attempts++;
      }
    }
    // Wizards (por ejemplo, 3 por tile)
    for (let i = 0; i < WIZARD_COUNT; i++) {
      let x, y, attempts = 0;
      let placed = false;
      while (attempts < 1000 && !placed) {
        x = Math.floor(rand() * width);
        y = Math.floor(rand() * height);
        if (terrainUtils.isValidTerrain(x, y, width, height, terrain)) {
          arr.push({ id: 'wizard-' + i, type: 'wizard', position: { x, y }, discovered: false });
          placed = true;
        }
        attempts++;
      }
    }
    // Tesoros (por ejemplo, 1 por tile, posición completamente aleatoria)
    for (let i = 0; i < TREASURE_COUNT; i++) {
      let x, y, attempts = 0;
      let placed = false;
      while (attempts < 1000 && !placed) {
        x = Math.floor(rand() * width);
        y = Math.floor(rand() * height);
        const tx = Math.floor(x * (terrain.length - 1) / (width - 1));
        const ty = Math.floor(y * (terrain.length - 1) / (height - 1));
        if (terrain[ty]?.[tx] > -0.05) {
          arr.push({ id: 'treasure-' + i, type: 'treasure', position: { x, y }, discovered: false });
          placed = true;
        }
        attempts++;
      }
    }
    poisByTile.value[key] = arr;
    pois.value = arr;
  }

  function checkDiscovery(playerPosition, playerStore) {
    pois.value.forEach(poi => {
      if (
        (poi.type === 'narrative' && Math.abs(poi.position.x - playerPosition.x) < 10 && Math.abs(poi.position.y - playerPosition.y) < 10)
        || (!poi.discovered && Math.abs(poi.position.x - playerPosition.x) < 10 && Math.abs(poi.position.y - playerPosition.y) < 10)
      ) {
        if (poi.type !== 'narrative') poi.discovered = true;
        if (poi.type === 'darkKnight') {
          console.log('🏰 Entrando al castillo, iniciando combate con Dark Knight en', poi.position);
          if (typeof playerStore.startCombatWith === 'function') {
            playerStore.startCombatWith({ type: 'darkknight' });
          } else {
            playerStore.startCombat();
          }
        } else if (poi.type === 'wizard') {
          // Abrir WizardPopup
          playerStore.wizardActive = true;
          console.log('🧙‍♂️ Descubierto wizard en', poi.position);
        } else if (poi.type === 'treasure') {
          treasureDiscovered.value = true;
          console.log('💰 Tesoro descubierto en', poi.position);
        } else if (poi.type === 'narrative') {
          // Activar cuadro narrativo
          if (typeof playerStore.showNarrative === 'function') {
            playerStore.showNarrative(poi.narrativeData);
          }
        }
      }
    });
  }

  function addNarrativePoi(position, narrativeData) {
    // Añade un POI narrativo en la posición actual
    const key = `${position.offsetX},${position.offsetY}`;
    if (!poisByTile.value[key]) poisByTile.value[key] = [];
    poisByTile.value[key].push({
      id: 'narrative-' + Date.now(),
      type: 'narrative',
      position: { x: position.x, y: position.y },
      discovered: false,
      narrativeData
    });
    pois.value = poisByTile.value[key];
  }

  // Agrega un enemigo derrotado de cualquier tipo
  function addDefeatedEnemy(position, type) {
    if (position.offsetX === undefined || position.offsetY === undefined) {
      console.warn('addDefeatedEnemy: falta offsetX/offsetY');
    }
    defeatedEnemies.value.push({
      type,
      x: position.x,
      y: position.y,
      offsetX: position.offsetX,
      offsetY: position.offsetY
    });
  }

  return { pois, ensureForTile, resetPois, checkDiscovery, defeatedEnemies, addDefeatedEnemy, treasureDiscovered, addNarrativePoi };
});