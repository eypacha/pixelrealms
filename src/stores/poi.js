
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DARK_KNIGHT_COUNT, LOOT_MIN, LOOT_MAX, TREASURE_COUNT, WIZARD_COUNT, DRAGON_COUNT} from '../constants/poi.js';
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

    // Configuración de tipos de POI
    const poiConfigs = [
      {
        type: 'darkknight',
        count,
        isValid: (x, y) => terrainUtils.isValidTerrain(x, y, width, height, terrain),
        extra: () => ({ loot: Math.floor(rand() * (LOOT_MAX - LOOT_MIN + 1)) + LOOT_MIN })
      },
      {
        type: 'wizard',
        count: WIZARD_COUNT,
        isValid: (x, y) => terrainUtils.isValidTerrain(x, y, width, height, terrain),
        extra: () => ({})
      },
      {
        type: 'treasure',
        count: TREASURE_COUNT,
        isValid: (x, y) => {
          const tx = Math.floor(x * (terrain.length - 1) / (width - 1));
          const ty = Math.floor(y * (terrain.length - 1) / (height - 1));
          return terrain[ty]?.[tx] > -0.05;
        },
        extra: () => ({})
      },
      {
        type: 'dragon',
        count: DRAGON_COUNT,
        isValid: (x, y) => terrainUtils.isValidTerrain(x, y, width, height, terrain),
        extra: () => ({ loot: Math.floor(rand() * (LOOT_MAX - LOOT_MIN + 1)) + LOOT_MIN })
      }
    ];

    poiConfigs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        let x, y, attempts = 0;
        let placed = false;
        while (attempts < 1000 && !placed) {
          x = Math.floor(rand() * width);
          y = Math.floor(rand() * height);
          if (config.isValid(x, y)) {
            arr.push({
              id: `${config.type}-${i}`,
              type: config.type,
              position: { x, y },
              discovered: false,
              revealed: false,
              ...config.extra()
            });
            placed = true;
          }
          attempts++;
        }
      }
    });

    poisByTile.value[key] = arr;
    pois.value = arr;
  }

  // Revela los POIs dentro de un radio del jugador
  function revealPoi(playerPosition) {
    pois.value.forEach(poi => {
      const dx = poi.position.x - playerPosition.x;
      const dy = poi.position.y - playerPosition.y;
      if (Math.sqrt(dx*dx + dy*dy) <=100) {
        poi.revealed = true;
      }
    });
  }
    
  function checkDiscovery(playerPosition, playerStore) {
    pois.value.forEach(poi => {
      if (
        (poi.type === 'narrative' && Math.abs(poi.position.x - playerPosition.x) < 10 && Math.abs(poi.position.y - playerPosition.y) < 10)
        || (!poi.discovered && Math.abs(poi.position.x - playerPosition.x) < 10 && Math.abs(poi.position.y - playerPosition.y) < 10)
      ) {
        if (poi.type !== 'narrative') poi.discovered = true;
        if (poi.type === 'darkknight') {
          console.log('🏰 Entrando al castillo, iniciando combate con Dark Knight en', poi.position);
          playerStore.startCombat('darkknight');
        } else if (poi.type === 'dragon') {
          console.log('🐉 Entrando en combate con Dragón en', poi.position);
          playerStore.startCombat('dragon');
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
    // Unificado: acepta cualquier tipo de enemigo
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

  return { pois, ensureForTile, resetPois, checkDiscovery, defeatedEnemies, addDefeatedEnemy, treasureDiscovered, addNarrativePoi, revealPoi };
});