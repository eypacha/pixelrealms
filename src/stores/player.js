import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePoiStore } from './poi.js';
import { ref } from 'vue';
import {
    PLAYER_SPEED,
    INITIAL_HEALTH,
    INITIAL_STRENGTH,
    INITIAL_DEFENSE,
    COVER_AMOUNT,
    INITIAL_COINS,
    INITIAL_POTIONS,
    PLAYER_HIT_CHANCE,
    RECOVERY_STEPS,
  } from '../constants/player.js';

import {
  ENCOUNTER_RATE_DAY,
  ENCOUNTER_RATE_NIGHT,
  ENEMY_PAUSE,
  GOBLIN,
  GOBLIN_HEALTH,
  GOBLIN_STRENGTH,
  GOBLIN_DEFENSE,
  ORC,
  ORC_HEALTH,
  ORC_STRENGTH,
  ORC_DEFENSE,
  DARK_KNIGHT,
  DARK_KNIGHT_HEALTH,
  DARK_KNIGHT_STRENGTH,
  DARK_KNIGHT_DEFENSE,
  SKELETON,
  SKELETON_HEALTH,
  SKELETON_STRENGTH,
  SKELETON_DEFENSE,
  ENEMY_HIT_CHANCE,
} from '../constants/enemies.js';

import { useTimeStore } from './time.js';

import { createSeededRandom } from '../utilities/randomWithSeed.js';
import { getColorForHeight } from '../utilities/draw.js';
import { useSoundStore } from './sound.js';
import { calculateDamage } from '../utilities/calculateDamage.js';

export const usePlayerStore = defineStore('player', () => {

  const soundStore = useSoundStore();
  const timeStore = useTimeStore();

  // Recupera vida cada 3 pasos
  const { t } = useI18n();
  const position = ref({ x: 0, y: 0 });
  const oldPosition = ref({ x: 0, y: 0 });
  const seed = ref(Date.now());
  const health = ref(INITIAL_HEALTH);
  const maxHealth = ref(INITIAL_HEALTH);
  const strength = ref(INITIAL_STRENGTH);
  const defense = ref(INITIAL_DEFENSE);
  const coins = ref(INITIAL_COINS);
  const inventory = ref({ potion: INITIAL_POTIONS });

  const steps = ref(0);
  const mana = ref(0);
  const combatActive = ref(false);
  const gameOver = ref(false);
  const wizardActive = ref(false); // Para mostrar el WizardPopup
  const enemyHealth = ref(ORC_HEALTH);
  const enemyStrength = ref(ORC_STRENGTH);
  const enemyDefense = ref(ORC_DEFENSE);
  const enemyType = ref(ORC);
  const playerTurn = ref(true);
  const combatMessage = ref('');
  const combatMessageKey = ref('combat.start');
  const combatMessageParams = ref({});
  const coverActive = ref(false);
  const enemyDefeated = ref(false);
  const lootCollected = ref(false);
  const lastDirection = ref('right');
  const darkKnightDefeatedCount = ref(0);
  const enemyFrozen = ref(false);
  
  // Offset actual del tile
  const currentOffset = ref({ x: 0, y: 0 });
  
  let terrainRef = null;
  let widthRef = 0;
  let heightRef = 0;
  let encounterRandom = null;

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

  function reset() {
      health.value = maxHealth.value;
      strength.value = 10;
      defense.value = 10;
      coins.value = 10;
      inventory.value.potion = 2;
      mana.value = 0;
      combatActive.value = false;
      gameOver.value = false;
      wizardActive.value = false;
      enemyHealth.value = 10;
      enemyStrength.value = 5;
      enemyDefense.value = 2;
      enemyType.value = ORC;
      playerTurn.value = true;
      coverActive.value = false;
      enemyDefeated.value = false;
      lootCollected.value = false;
      lastDirection.value = 'right';
      darkKnightDefeatedCount.value = 0;
      currentOffset.value = { x: 0, y: 0 };
    }

  function startCombat() {
    // Probabilidad de aparición de enemigos
    const enemies = [
      { type: GOBLIN, health: GOBLIN_HEALTH, strength: GOBLIN_STRENGTH, defense: GOBLIN_DEFENSE },
      { type: ORC, health: ORC_HEALTH, strength: ORC_STRENGTH, defense: ORC_DEFENSE },
      { type: SKELETON, health: SKELETON_HEALTH, strength: SKELETON_STRENGTH, defense: SKELETON_DEFENSE },
    ];
    const idx = Math.floor(Math.random() * enemies.length);
    const enemy = enemies[idx];
    enemyType.value = enemy.type;
    enemyHealth.value = enemy.health;
    enemyStrength.value = enemy.strength;
    enemyDefense.value = enemy.defense;
    playerTurn.value = true;
    combatActive.value = true;
    combatMessage.value = t('combat.start');
    combatMessageKey.value = 'combat.start';
    combatMessageParams.value = {};
  }

  // Start combat with specific enemy type (e.g., { type: 'darkknight' })
  function startCombatWith(options = {}) {
    const type = options.type || ORC;
    enemyType.value = type;
    if (type === DARK_KNIGHT) {
      // Dificultad progresiva
      const scale = darkKnightDefeatedCount.value;
      enemyHealth.value = DARK_KNIGHT_HEALTH + scale * 2;
      enemyStrength.value = DARK_KNIGHT_STRENGTH + scale * 2;
      enemyDefense.value = DARK_KNIGHT_DEFENSE + scale * 2;
    } else {
      // fallback to orc-like stats
      enemyHealth.value = ORC_HEALTH;
      enemyStrength.value = ORC_STRENGTH;
      enemyDefense.value = ORC_DEFENSE;
    }
      playerTurn.value = true;
      combatActive.value = true;
      combatMessage.value = t('combat.start');
      combatMessageKey.value = 'combat.start';
      combatMessageParams.value = {};
  }

  function playerAttack(damage) {
    const combatRandom = createSeededRandom(seed.value + 'combat' + Date.now());
    const hitChance = PLAYER_HIT_CHANCE;
    if (combatRandom() < hitChance) {
      const { damage: actualDamage, isCritical } = calculateDamage(damage, enemyDefense.value);
      combatMessage.value = isCritical
        ? t('combat.critical', { value: actualDamage })
        : t('combat.hit', { value: actualDamage });
      enemyHealth.value -= actualDamage;
      soundStore.playSound(isCritical ? 'critical' : 'kling');
      console.log(`Jugador ataca: ${actualDamage} daño${isCritical ? ' (CRÍTICO)' : ''}. Salud enemigo: ${enemyHealth.value}`);
      if (enemyHealth.value <= 0) {
        combatMessage.value = t('combat.enemyDefeated');
        console.log('Enemigo derrotado!');
        // Si era un darkknight, aumentar el contador
        if (enemyType.value === DARK_KNIGHT) {
          darkKnightDefeatedCount.value++;
        }
        // Si era un orc, agregarlo a defeatedOrcs
        if (enemyType.value === ORC) {
          const poiStore = usePoiStore();
          // Usar el offset actual guardado en el store
          const wx = currentOffset.value.x;
          const wy = currentOffset.value.y;
          poiStore.addDefeatedEnemy({ x: position.value.x, y: position.value.y, offsetX: wx, offsetY: wy }, 'orc');
        }
        if (enemyType.value === GOBLIN) {
          const poiStore = usePoiStore();
          const wx = currentOffset.value.x;
          const wy = currentOffset.value.y;
          poiStore.addDefeatedEnemy({ x: position.value.x, y: position.value.y, offsetX: wx, offsetY: wy }, 'goblin');
        }
        // Mark enemy as defeated and wait for player to loot or continue
        enemyDefeated.value = true;
        playerTurn.value = false;
        lootCollected.value = false;
      } else {
        playerTurn.value = false;
        setTimeout(() => {
          enemyAttack();
        }, ENEMY_PAUSE);
      }
    } else {
      console.log('Jugador falla el ataque!');
      soundStore.playSound('whosh');
      combatMessage.value = t('combat.miss');
        combatMessage.value = t('combat.miss');
      playerTurn.value = false;
      setTimeout(() => {
        enemyAttack();
      }, ENEMY_PAUSE);
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
    }, ENEMY_PAUSE);
  }

  function enemyAttack() {
    if (enemyFrozen.value) {
      // 50% chance to thaw
      if (Math.random() < 0.5) {
        combatMessage.value = t('combat.enemyTurn') + ' (Frozen: skips turn)';
        playerTurn.value = true;
        return;
      } else {
        enemyFrozen.value = false;
        combatMessage.value = t('combat.enemyTurn') + ' (Thawed!)';
      }
    }
    const combatRandom = createSeededRandom(seed.value + 'enemyCombat' + Date.now());
    const hitChance = ENEMY_HIT_CHANCE;
    if (combatRandom() < hitChance) {
      const { damage, isCritical } = calculateDamage(enemyStrength.value, defense.value);
      combatMessage.value = isCritical
        ? t('combat.critical', { value: damage })
        : t('combat.hit', { value: damage });
      health.value -= damage;
      soundStore.playSound(isCritical ? 'critical' : 'hammer');
      console.log(`Enemigo ataca: ${damage} daño${isCritical ? ' (CRÍTICO)' : ''}. Salud jugador: ${health.value}`);
      if (health.value <= 0) {
        combatMessage.value = 'Player defeated!';
          combatMessage.value = t('combat.playerDefeated');
          combatMessage.value = t('combat.miss');
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
      combatMessage.value = t('combat.healed', { value: healed });
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
    }, ENEMY_PAUSE);
  }

  function checkEncounter() {
    console.log('Checking for encounter. isNight', timeStore.isNight);
    const rate = timeStore.isNight ? ENCOUNTER_RATE_NIGHT : ENCOUNTER_RATE_DAY;
    if (encounterRandom() < rate) {
      startCombat();
    }
  }

  function fleeCombat() {
    soundStore.playSound('whosh');

    setTimeout(() => {
      enemyAttack();
    }, ENEMY_PAUSE);

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
      console.log('🚶 Mover arriba');
      MoveTo(position);
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
      console.log('🚶 Mover abajo');
      MoveTo(position);
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
      console.log('🚶 Mover izquierda');
      MoveTo(position);
      return true;
    } else {
      console.log('No puede mover izquierda');
      return false;
    }
  }
  function moveRight() {
    const { x, y } = position.value;
    if (canMoveTo(x + PLAYER_SPEED, y)) {
      console.log('🚶 Mover derecha');
      oldPosition.value = { ...position.value };
      position.value.x += PLAYER_SPEED;
      lastDirection.value = 'right';
      MoveTo(position);
      return true;
    } else {
      console.log('No puede mover derecha');
      return false;
    }
  }

  function MoveTo(position) {
    steps.value += 1;
    timeStore.registerMove();
    if (steps.value % RECOVERY_STEPS === 0) {
      health.value = Math.min(maxHealth.value, health.value + 1);
    }
    checkEncounter(position.value);
  }

  function getTerrainColor() {
    if (!terrainRef) return '#cccccc'; // default
    const { x, y } = position.value;
    const tx = Math.floor(x * (terrainRef.length - 1) / (widthRef - 1));
    const ty = Math.floor(y * (terrainRef.length - 1) / (heightRef - 1));
    const h = terrainRef[ty]?.[tx] || 0;
    return getColorForHeight(h);
  }

  function fireballAttack() {
    if (!combatActive.value || !playerTurn.value) return;
    if (mana.value < 1) {
      combatMessage.value = 'Not enough mana!';
        combatMessage.value = t('combat.notEnoughMana');
      return;
    }
    const combatRandom = Math.random(); // No seed, para simpleza
    if (combatRandom < 0.9) {
      enemyHealth.value -= 3;
      combatMessage.value = 'Fireball! -3';
        combatMessage.value = t('combat.fireballHit', { value: 3 });
      soundStore.playSound('fireball');
      if (enemyHealth.value <= 0) {
        combatMessage.value = 'Enemy defeated!';
        enemyDefeated.value = true;
        playerTurn.value = false;
        lootCollected.value = false;
      } else {
        playerTurn.value = false;
        setTimeout(() => {
          enemyAttack();
        }, ENEMY_PAUSE);
      }
    } else {
      combatMessage.value = 'Fireball missed!';
        combatMessage.value = t('combat.fireballMissed');
      soundStore.playSound('whosh');
      playerTurn.value = false;
      setTimeout(() => {
        enemyAttack();
      }, ENEMY_PAUSE);
    }
    mana.value -= 1;
  }

  function freezeEnemy() {
    if (!combatActive.value || !playerTurn.value || mana.value < 2) return;
    enemyFrozen.value = true;
    combatMessage.value = t('combat.frozen');
    mana.value -= 2;
    soundStore.playSound('freeze');
    playerTurn.value = false;
    setTimeout(() => {
      playerTurn.value = true;
    }, 500);
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
    combatActive,
    gameOver,
    wizardActive,
    enemyHealth,
    enemyStrength,
    enemyDefense,
    enemyType,
    playerTurn,
    combatMessage,
    combatMessageKey,
    combatMessageParams,
    coverActive,
    enemyDefeated,
    lootCollected,
    lastDirection,
    darkKnightDefeatedCount,
    enemyFrozen,
    currentOffset,
    initialize,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    startCombat,
    startCombatWith,
    playerAttack,
    enemyAttack,
    activateCover,
    fleeCombat,
    collectLoot,
    endCombat,
    heal,
    usePotion,
    getTerrainColor,
    fireballAttack,
    freezeEnemy,
    reset
  };
});
