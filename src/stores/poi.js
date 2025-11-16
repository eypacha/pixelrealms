import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CASTLE_COUNT, LOOT_MIN, LOOT_MAX } from '../constants/poi.js';
import { useSoundStore } from './sound.js';

export const usePoiStore = defineStore('poi', () => {
  const pois = ref([]);
  const soundStore = useSoundStore();

  function initialize(terrain, width, height, randomFn, count = CASTLE_COUNT) {
    pois.value = [];
    for (let i = 0; i < count; i++) {
      let x, y, attempts = 0;
      let placed = false;
      while (attempts < 1000 && !placed) {
        x = Math.floor(randomFn() * width);
        y = Math.floor(randomFn() * height);
        const tx = Math.floor(x * (terrain.length - 1) / (width - 1));
        const ty = Math.floor(y * (terrain.length - 1) / (height - 1));
        if (terrain[ty]?.[tx] > -0.05) {
          const loot = Math.floor(randomFn() * (LOOT_MAX - LOOT_MIN + 1)) + LOOT_MIN;
          pois.value.push({ id: i, type: 'castle', position: { x, y }, discovered: false, loot });
          placed = true;
        }
        attempts++;
      }
    }
  }

  function checkDiscovery(playerPosition, playerStore) {
    pois.value.forEach(poi => {
      if (!poi.discovered && Math.abs(poi.position.x - playerPosition.x) < 10 && Math.abs(poi.position.y - playerPosition.y) < 10) {
        poi.discovered = true;
        playerStore.coins += poi.loot;
        soundStore.playCoin();
        console.log('🏰 Descubierto punto de interés:', poi.type, 'en', poi.position, 'Botín:', poi.loot);
      }
    });
  }

  return { pois, initialize, checkDiscovery };
});