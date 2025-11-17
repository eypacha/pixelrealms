import { defineStore } from 'pinia';
import { ref } from 'vue';
import { PLAYER_SPEED, ENCOUNTER_RATE, INITIAL_HEALTH, INITIAL_STRENGTH, INITIAL_DEFENSE, COVER_AMOUNT, INITIAL_COINS, INITIAL_POTIONS } from '../constants/player.js';
import { createSeededRandom } from '../utilities/randomWithSeed.js';
import { getColorForHeight } from '../utilities/draw.js';
import { useSoundStore } from './sound.js';

export const usePlayerStore = defineStore('player', () => {
  const position = ref({ x: 0, y: 0 });
  const oldPosition = ref({ x: 0, y: 0 });
  const seed = ref(Date.now());
  const health = ref(INITIAL_HEALTH);
  const maxHealth = ref(INITIAL_HEALTH);
  const strength = ref(INITIAL_STRENGTH);
  const defense = ref(INITIAL_DEFENSE);
  const coins = ref(INITIAL_COINS);
  const inventory = ref({ potion: INITIAL_POTIONS });
  const combatActive = ref(false);
  const gameOver = ref(false);
  const wizardActive = ref(false); // Para mostrar el WizardPopup
  const enemyHealth = ref(10);
  const enemyStrength = ref(8);
  const enemyDefense = ref(5);
  const enemyType = ref('goblin');
  const playerTurn = ref(true);
  const combatMessage = ref('Combat start');
  const coverActive = ref(false);
  const enemyDefeated = ref(false);
  const lootCollected = ref(false);
  const lastDirection = ref('right');
  const darkKnightDefeatedCount = ref(0);
  
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
    // default enemy (goblin)
    enemyType.value = 'goblin';
    enemyHealth.value = 10;
    enemyStrength.value = 8;
    enemyDefense.value = 5;
    playerTurn.value = true;
    combatActive.value = true;
    combatMessage.value = 'Combat start';
  }

  // Start combat with specific enemy type (e.g., { type: 'darkknight' })
  function startCombatWith(options = {}) {
    const type = options.type || 'goblin';
    enemyType.value = type;
    if (type === 'darkknight') {
      // Dificultad progresiva
      const baseHealth = 15;
      const baseStrength = 12;
      const baseDefense = 10;
      const scale = darkKnightDefeatedCount.value;
      enemyHealth.value = baseHealth + scale * 2;
      enemyStrength.value = baseStrength + scale * 2;
      enemyDefense.value = baseDefense + scale * 2;
    } else {
      // fallback to goblin-like stats
      enemyHealth.value = 10;
      enemyStrength.value = 8;
      enemyDefense.value = 5;
    }
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
      soundStore.playSound('kling');
      console.log(`Jugador ataca: ${actualDamage} daño. Salud enemigo: ${enemyHealth.value}`);
      if (enemyHealth.value <= 0) {
        combatMessage.value = 'Enemy defeated!';
        console.log('Enemigo derrotado!');
        // Si era un darkknight, aumentar el contador
        if (enemyType.value === 'darkknight') {
          darkKnightDefeatedCount.value++;
        }
        // Mark enemy as defeated and wait for player to loot or continue
        enemyDefeated.value = true;
        playerTurn.value = false;
        lootCollected.value = false;
      } else {
        playerTurn.value = false;
        setTimeout(() => {
          enemyAttack();
        }, 1000);
      }
    } else {
      console.log('Jugador falla el ataque!');
      soundStore.playSound('whosh');
      combatMessage.value = 'Miss';
      playerTurn.value = false;
      setTimeout(() => {
        enemyAttack();
      }, 1000);
    }
  }

  function collectLoot() {
    if (!enemyDefeated.value) return 0;
    if (lootCollected.value) return 0;
    const combatRandom = createSeededRandom(seed.value + 'loot' + Date.now());
    // Random coins between 1 and 10
    const reward = Math.floor(combatRandom() * 10) + 1;
    // Separate roll for potion chance
    const potionRoll = combatRandom();
    const potionGiven = potionRoll < 0.2; // 20% chance
    coins.value += reward;
    if (potionGiven) {
      // Ensure inventory.potion exists
      if (!inventory.value.potion) inventory.value.potion = 0;
      inventory.value.potion += 1;
    }
    lootCollected.value = true;
    // play coin sound
    soundStore.playSound('coin');
    return { coins: reward, potion: potionGiven };
  }

  function endCombat() {
    // Close combat and reset defeated flags
    combatActive.value = false;
    enemyDefeated.value = false;
    lootCollected.value = false;
  }

  function activateCover() {
    if (!playerTurn.value) return;
    // Increase defense and mark cover active until enemy finishes its attack
    defense.value += COVER_AMOUNT;
    coverActive.value = true;
    combatMessage.value = 'Cover';
    playerTurn.value = false;
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  }

  function enemyAttack() {
    const combatRandom = createSeededRandom(seed.value + 'enemyCombat' + Date.now());
    const hitChance = 0.6; // 60% chance to hit for enemy
    if (combatRandom() < hitChance) {
      const damage = Math.max(1, enemyStrength.value - defense.value);
      combatMessage.value = `Hit -${damage}`;
      health.value -= damage;
      soundStore.playSound('hammer');
      console.log(`Enemigo ataca: ${damage} daño. Salud jugador: ${health.value}`);
      if (health.value <= 0) {
        combatMessage.value = 'Player defeated!';
        console.log('Jugador derrotado!');
        setTimeout(() => {
          combatActive.value = false;
          gameOver.value = true;
        }, 2000);
      } else {
        // clear cover after enemy finished its attack
        if (coverActive.value) {
          defense.value -= COVER_AMOUNT;
          coverActive.value = false;
        }
        playerTurn.value = true;
      }
    } else {
      console.log('Enemigo falla el ataque!');
      soundStore.playSound('whosh');
      combatMessage.value = 'Miss';
      // clear cover even if enemy misses
      if (coverActive.value) {
        defense.value -= COVER_AMOUNT;
        coverActive.value = false;
      }
      playerTurn.value = true;
    }
  }

  // Heal the player by amount (not exceeding maxHealth)
  function heal(amount) {
    const before = health.value;
    health.value = Math.min(maxHealth.value, health.value + amount);
    const healed = health.value - before;
    if (healed > 0) {
      combatMessage.value = `Healed +${healed}`;
    }
  }

  // Use a potion in combat: consumes player's turn and triggers enemy attack
  function usePotion() {
    if (!combatActive.value) return;
    if (!playerTurn.value) return;
    if (!inventory.value.potion || inventory.value.potion <= 0) return;
    inventory.value.potion -= 1;
    // heal 5 HP (tunable)
    heal(5);
    // play gulp sound when potion is consumed
    soundStore.playSound('gulp');
    // after using potion, enemy takes its turn
    playerTurn.value = false;
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  }

  function checkEncounter(pos) {
    if (encounterRandom() < ENCOUNTER_RATE) {
      startCombat();
    }
  }

  function fleeCombat() {
    soundStore.playSound('whosh');
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
      return true;
    } else {
      console.log('No puede mover arriba');
      return false;
    }
  }
  function moveDown() {
    const { x, y } = position.value;
    if (canMoveTo(x, y + PLAYER_SPEED)) {
      oldPosition.value = { ...position.value };
      position.value.y += PLAYER_SPEED;
      console.log('🚶 Mover abajo:', position.value);
      checkEncounter(position.value);
      return true;
    } else {
      console.log('No puede mover abajo');
      return false;
    }
  }
  function moveLeft() {
    const { x, y } = position.value;
    if (canMoveTo(x - PLAYER_SPEED, y)) {
      oldPosition.value = { ...position.value };
      position.value.x -= PLAYER_SPEED;
      lastDirection.value = 'left';
      console.log('🚶 Mover izquierda:', position.value);
      checkEncounter(position.value);
      return true;
    } else {
      console.log('No puede mover izquierda');
      return false;
    }
  }
  function moveRight() {
    const { x, y } = position.value;
    if (canMoveTo(x + PLAYER_SPEED, y)) {
      oldPosition.value = { ...position.value };
      position.value.x += PLAYER_SPEED;
      lastDirection.value = 'right';
      console.log('🚶 Mover derecha:', position.value);
      checkEncounter(position.value);
      return true;
    } else {
      console.log('No puede mover derecha');
      return false;
    }
  }

  function getTerrainColor() {
    if (!terrainRef) return '#cccccc'; // default
    const { x, y } = position.value;
    const tx = Math.floor(x * (terrainRef.length - 1) / (widthRef - 1));
    const ty = Math.floor(y * (terrainRef.length - 1) / (heightRef - 1));
    const h = terrainRef[ty]?.[tx] || 0;
    return getColorForHeight(h);
  }

  return { position, oldPosition, seed, health, maxHealth, strength, defense, coins, inventory, combatActive, gameOver, wizardActive, enemyHealth, enemyStrength, enemyDefense, enemyType, playerTurn, combatMessage, coverActive, enemyDefeated, lootCollected, lastDirection, darkKnightDefeatedCount, initialize, moveUp, moveDown, moveLeft, moveRight, startCombat, startCombatWith, playerAttack, enemyAttack, activateCover, fleeCombat, collectLoot, endCombat, heal, usePotion, getTerrainColor };
});
