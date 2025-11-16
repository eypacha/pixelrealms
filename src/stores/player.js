import { defineStore } from 'pinia';
import { ref } from 'vue';
import { PLAYER_SPEED } from '../constants/player.js';
import { createSeededRandom } from '../utilities/randomWithSeed.js';
import { useSoundStore } from './sound.js';

export const usePlayerStore = defineStore('player', () => {
  const position = ref({ x: 0, y: 0 });
  const oldPosition = ref({ x: 0, y: 0 });
  const seed = ref(Date.now());
  const health = ref(10);
  const strength = ref(10);
  const defense = ref(10);
  const coins = ref(0);
  const combatActive = ref(false);
  const gameOver = ref(false);
  const enemyHealth = ref(10);
  const enemyStrength = ref(8);
  const enemyDefense = ref(5);
  const playerTurn = ref(true);
  const combatMessage = ref('Inicio de combate');
  let terrainRef = null;
  let widthRef = 0;
  let heightRef = 0;
  let encounterRandom = null;

  const soundStore = useSoundStore();

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
        return;
      }
      attempts++;
    }
    // Si no encuentra tierra, dejar en (0,0)
    position.value = { x: 0, y: 0 };
    oldPosition.value = { ...position.value };
  }

  function startCombat() {
    enemyHealth.value = 20;
    enemyStrength.value = 8;
    enemyDefense.value = 5;
    playerTurn.value = true;
    combatActive.value = true;
    combatMessage.value = 'Combat start';
  }

  function playerAttack(damage) {
    const combatRandom = createSeededRandom(seed.value + 'combat' + Date.now());
    const hitChance = 0.7; // 70% chance to hit
    if (combatRandom() < hitChance) {
      const actualDamage = Math.max(1, damage - enemyDefense.value);
      combatMessage.value = `Hit -${actualDamage}`;
      enemyHealth.value -= actualDamage;
      soundStore.playKling();
      console.log(`Jugador ataca: ${actualDamage} daño. Salud enemigo: ${enemyHealth.value}`);
      if (enemyHealth.value <= 0) {
        combatMessage.value = 'Enemy defeated!';
        console.log('Enemigo derrotado!');


        setTimeout(() => {
           soundStore.playCoin();
        }, 500);
        
        setTimeout(() => {
          combatActive.value = false;
          coins.value += 5; // reward
          
        }, 2000);
      } else {
        playerTurn.value = false;
        setTimeout(() => {
          enemyAttack();
        }, 1000);
      }
    } else {
      console.log('Jugador falla el ataque!');
      soundStore.playWhosh();
      combatMessage.value = 'Miss';
      playerTurn.value = false;
      setTimeout(() => {
        enemyAttack();
      }, 1000);
    }
  }

  function enemyAttack() {
    const combatRandom = createSeededRandom(seed.value + 'enemyCombat' + Date.now());
    const hitChance = 0.6; // 60% chance to hit for enemy
    if (combatRandom() < hitChance) {
      const damage = Math.max(1, enemyStrength.value - defense.value);
      combatMessage.value = `Hit -${damage}`;
      health.value -= damage;
      soundStore.playHammer();
      console.log(`Enemigo ataca: ${damage} daño. Salud jugador: ${health.value}`);
      if (health.value <= 0) {
        combatMessage.value = 'Player defeated!';
        console.log('Jugador derrotado!');
        setTimeout(() => {
          combatActive.value = false;
          gameOver.value = true;
        }, 2000);
      } else {
        playerTurn.value = true;
      }
    } else {
      console.log('Enemigo falla el ataque!');
      soundStore.playWhosh();
      combatMessage.value = 'Miss';
      playerTurn.value = true;
    }
  }

  function checkEncounter(pos) {
    if (encounterRandom() < 0.2) {
      startCombat();
    }
  }

  function fleeCombat() {
    soundStore.playWhosh();
    combatActive.value = false;
    console.log('Huiste del combate');
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
      console.log('🚶 Mover arriba:', position.value);
      checkEncounter(position.value);
    } else {
      console.log('No puede mover arriba');
    }
  }
  function moveDown() {
    const { x, y } = position.value;
    if (canMoveTo(x, y + PLAYER_SPEED)) {
      oldPosition.value = { ...position.value };
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
      oldPosition.value = { ...position.value };
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
      oldPosition.value = { ...position.value };
      position.value.x += PLAYER_SPEED;
      console.log('🚶 Mover derecha:', position.value);
      checkEncounter(position.value);
    } else {
      console.log('No puede mover derecha');
    }
  }

  function getTerrainColor() {
    if (!terrainRef) return '#cccccc'; // default
    const { x, y } = position.value;
    const tx = Math.floor(x * (terrainRef.length - 1) / (widthRef - 1));
    const ty = Math.floor(y * (terrainRef.length - 1) / (heightRef - 1));
    const h = terrainRef[ty]?.[tx] || 0;
    let color = '#228B22';
    if (h < -0.05) color = '#1e90ff';
    else if (h < 0.05) color = '#deb887';
    else if (h > 0.3) color = '#cccccc';
    return color;
  }

  return { position, oldPosition, seed, health, strength, defense, coins, combatActive, gameOver, enemyHealth, enemyStrength, enemyDefense, playerTurn, combatMessage, initialize, moveUp, moveDown, moveLeft, moveRight, startCombat, playerAttack, enemyAttack, fleeCombat, getTerrainColor };
});
