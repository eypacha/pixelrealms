import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DARK_KNIGHT_COUNT, LOOT_MIN, LOOT_MAX } from '../constants/poi.js';
import { useSoundStore } from './sound.js';
import { createSeededRandom } from '../utilities/randomWithSeed.js';

export const usePoiStore = defineStore('poi', () => {
    // Array de { x, y, offsetX, offsetY }
    const defeatedGoblins = ref([]);
  // Mapa de POIs por tile key 'offsetX,offsetY'
  const poisByTile = ref({});
  const pois = ref([]); // current tile pois
  const soundStore = useSoundStore();
  // Generate POIs for a specific tile defined by offsetX, offsetY (in grid indices)
  // Now generates both 'darkKnight' and 'wizard' POIs
  function ensureForTile(offsetX, offsetY, terrain, width, height, seed, count = DARK_KNIGHT_COUNT) {
    const key = `${offsetX},${offsetY}`;
    if (poisByTile.value[key]) {
      pois.value = poisByTile.value[key];
      return;
    }
    const rand = createSeededRandom(String(seed) + ':poi:' + key);
    const arr = [];
    // Castles
    for (let i = 0; i < count; i++) {
      let x, y, attempts = 0;
      let placed = false;
      while (attempts < 1000 && !placed) {
        x = Math.floor(rand() * width);
        y = Math.floor(rand() * height);
        const tx = Math.floor(x * (terrain.length - 1) / (width - 1));
        const ty = Math.floor(y * (terrain.length - 1) / (height - 1));
        if (terrain[ty]?.[tx] > -0.05) {
          const loot = Math.floor(rand() * (LOOT_MAX - LOOT_MIN + 1)) + LOOT_MIN;
          arr.push({ id: 'darkKnight-' + i, type: 'darkKnight', position: { x, y }, discovered: false, loot });
          placed = true;
        }
        attempts++;
      }
    }
    // Wizards (por ejemplo, 3 por tile)
    const WIZARD_COUNT = 3;
    for (let i = 0; i < WIZARD_COUNT; i++) {
      let x, y, attempts = 0;
      let placed = false;
      while (attempts < 1000 && !placed) {
        x = Math.floor(rand() * width);
        y = Math.floor(rand() * height);
        const tx = Math.floor(x * (terrain.length - 1) / (width - 1));
        const ty = Math.floor(y * (terrain.length - 1) / (height - 1));
        if (terrain[ty]?.[tx] > -0.05) {
          arr.push({ id: 'wizard-' + i, type: 'wizard', position: { x, y }, discovered: false });
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
      if (!poi.discovered && Math.abs(poi.position.x - playerPosition.x) < 10 && Math.abs(poi.position.y - playerPosition.y) < 10) {
        poi.discovered = true;
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
        } 
      }
    });
  }

  function addDefeatedGoblin(position) {
    // Recibe también el offset actual
    if (position.offsetX === undefined || position.offsetY === undefined) {
      console.warn('addDefeatedGoblin: falta offsetX/offsetY');
    }
    defeatedGoblins.value.push({ x: position.x, y: position.y, offsetX: position.offsetX, offsetY: position.offsetY });
  }

  return { pois, ensureForTile, checkDiscovery, defeatedGoblins, addDefeatedGoblin };
});