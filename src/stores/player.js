import { defineStore } from 'pinia';
import { ref } from 'vue';
import { PLAYER_SPEED } from '../constants/player.js';
import { createSeededRandom } from '../utilities/randomWithSeed.js';

export const usePlayerStore = defineStore('player', () => {
  const position = ref({ x: 0, y: 0 });
  const seed = ref(Date.now());
  const health = ref(5);
  const strength = ref(10);
  const defense = ref(10);
  const coins = ref(0);
  const combatActive = ref(false);
  let terrainRef = null;
  let widthRef = 0;
  let heightRef = 0;

  function initialize(terrain, width, height, randomFn) {
    terrainRef = terrain;
    widthRef = width;
    heightRef = height;
    let x, y, attempts = 0;
    while (attempts < 1000) {
      x = Math.floor(randomFn() * width);
      y = Math.floor(randomFn() * height);
      // Mapear a la matriz de alturas
      const tx = Math.floor(x * (terrain.length - 1) / (width - 1));
      const ty = Math.floor(y * (terrain.length - 1) / (height - 1));
      if (terrain[ty]?.[tx] > -0.05) {
        position.value = { x, y };
        return;
      }
      attempts++;
    }
    // Si no encuentra tierra, dejar en (0,0)
    position.value = { x: 0, y: 0 };
  }

  function checkEncounter(pos) {
    const random = createSeededRandom(`${Math.floor(pos.x)}_${Math.floor(pos.y)}`);
    if (random() < 0.2) {
      combatActive.value = true;
    }
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
      position.value.y -= PLAYER_SPEED;
      console.log('🚶 Mover arriba:', position.value);
      checkEncounter(position.value);
    } else {
      console.log('No puede mover arriba');
    }
  }
  function moveDown() {
    const { x, y } = position.value;
    if (canMoveTo(x, y + PLAYER_SPEED)) {
      position.value.y += PLAYER_SPEED;
      console.log('🚶 Mover abajo:', position.value);
      checkEncounter(position.value);
    } else {
      console.log('No puede mover abajo');
    }
  }
  function moveLeft() {
    const { x, y } = position.value;
    if (canMoveTo(x - PLAYER_SPEED, y)) {
      position.value.x -= PLAYER_SPEED;
      console.log('🚶 Mover izquierda:', position.value);
      checkEncounter(position.value);
    } else {
      console.log('No puede mover izquierda');
    }
  }
  function moveRight() {
    const { x, y } = position.value;
    if (canMoveTo(x + PLAYER_SPEED, y)) {
      position.value.x += PLAYER_SPEED;
      console.log('🚶 Mover derecha:', position.value);
      checkEncounter(position.value);
    } else {
      console.log('No puede mover derecha');
    }
  }

  return { position, seed, health, strength, defense, coins, combatActive, initialize, moveUp, moveDown, moveLeft, moveRight };
});
