
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DARK_KNIGHT_COUNT, VISIBILITY_RADIUS } from '../constants/poi.js';
import { createSeededRandom } from '../utilities/randomWithSeed.js';
import { useTerrain } from '../composables/useTerrain.js';
import { generatePoisForTile } from '../utilities/poiGenerator.js';
import { revealPois } from '../utilities/poiVisibility.js';
import { checkPoisDiscovery } from '../utilities/poiDiscovery.js';
import { addDefeatedEnemy as addDefeatedEnemyUtil } from '../utilities/poiDefeated.js';

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

  // Guarda cada posición visitada por el jugador como un POI de tipo 'step'
  function addStepPoi(position) {
    // Evita duplicados: solo agrega si no existe ya un step en esa posición
    if (!pois.value.some(p => p.type === 'step' && p.position?.x === position.x && p.position?.y === position.y)) {
      pois.value.push({
        type: 'step',
        position: { x: position.x, y: position.y }
      });
    }
  }

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
    const arr = generatePoisForTile({ terrainUtils, rand, width, height, terrain, seed, count });
    poisByTile.value[key] = arr;
    pois.value = arr;
  }

  // Revela los POIs dentro de un radio del jugador
  function revealPoi(playerPosition) {
    revealPois(pois.value, playerPosition, VISIBILITY_RADIUS);
  }

  function checkDiscovery(playerPosition, playerStore) {
    checkPoisDiscovery(pois.value, playerPosition, playerStore, treasureDiscovered);
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
    addDefeatedEnemyUtil(defeatedEnemies.value, position, type);
  }

  return { pois, ensureForTile, resetPois, checkDiscovery, defeatedEnemies, addDefeatedEnemy, treasureDiscovered, addNarrativePoi, revealPoi, addStepPoi };
});