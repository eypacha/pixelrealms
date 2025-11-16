import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CASTLE_COUNT, LOOT_MIN, LOOT_MAX } from '../constants/poi.js';
import { useSoundStore } from './sound.js';
import { createSeededRandom } from '../utilities/randomWithSeed.js';

export const usePoiStore = defineStore('poi', () => {
  // Mapa de POIs por tile key 'offsetX,offsetY'
  const poisByTile = ref({});
  const pois = ref([]); // current tile pois
  const soundStore = useSoundStore();
  // Generate POIs for a specific tile defined by offsetX, offsetY (in grid indices)
  // seed is used to make POIs deterministic per tile
  function ensureForTile(offsetX, offsetY, terrain, width, height, seed, count = CASTLE_COUNT) {
    const key = `${offsetX},${offsetY}`;
    if (poisByTile.value[key]) {
      pois.value = poisByTile.value[key];
      return;
    }
    const rand = createSeededRandom(String(seed) + ':poi:' + key);
    const arr = [];
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
          arr.push({ id: i, type: 'castle', position: { x, y }, discovered: false, loot });
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
            playerStore.coins += poi.loot;
            soundStore.playSound('coin');
        console.log('🏰 Descubierto punto de interés:', poi.type, 'en', poi.position, 'Botín:', poi.loot);
      }
    });
  }

  return { pois, ensureForTile, checkDiscovery };
});