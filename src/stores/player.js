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
  ENEMIES,
  ENEMY_HIT_CHANCE,
} from '../constants/enemies.js';

import { useTimeStore } from './time.js';

import { createSeededRandom } from '../utilities/randomWithSeed.js';
import { getColorForHeight } from '../utilities/draw.js';
import { useSoundStore } from './sound.js';
import { performAttack } from '../utilities/combatCalcs.js';

export const usePlayerStore = defineStore('player', () => {

  const soundStore = useSoundStore();
  const timeStore = useTimeStore();

  const { t } = useI18n();

  const seed = ref(Date.now());

  const position = ref({ x: 0, y: 0 });
  const oldPosition = ref({ x: 0, y: 0 });
  const health = ref(INITIAL_HEALTH);
  const maxHealth = ref(INITIAL_HEALTH);
  const strength = ref(INITIAL_STRENGTH);
  const defense = ref(INITIAL_DEFENSE);
  const coins = ref(INITIAL_COINS);
  const inventory = ref({ potion: INITIAL_POTIONS });

  const steps = ref(0);
  const mana = ref(0);

  const combatActive = ref(false);
  const enemyHealth = ref(undefined);
  const enemyStrength = ref(undefined);
  const enemyDefense = ref(undefined);
  const enemyType = ref(undefined);
  const combatMessage = ref('');
  const coverActive = ref(false);
  const enemyDefeated = ref(false);
  const lootCollected = ref(false);
  const gameOver = ref(false);

  const wizardActive = ref(false);
  const playerTurn = ref(true);
  const lastDirection = ref('down');
  const darkKnightDefeatedCount = ref(0);
  const enemyFrozen = ref(false);
  const playerFrozen = ref(false);
  
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

  // ...existing code...

  function reset() {
      health.value = maxHealth.value;
      strength.value = 10;
      defense.value = 10;
      coins.value = 10;
      inventory.value.potion = 2;
      mana.value = 0;
      enemyHealth.value = undefined;
      enemyStrength.value = undefined;
      enemyDefense.value = undefined;
      enemyType.value = undefined;
      currentOffset.value = { x: 0, y: 0 };
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

  function checkEncounter(pos) {
    const encounterRate = timeStore.isNight ? ENCOUNTER_RATE_NIGHT : ENCOUNTER_RATE_DAY;
    const roll = encounterRandom();
    if (roll < encounterRate) {
      startCombat();
    }
  }

  // Permite pasar el tipo de enemigo como parámetro
  const startCombat = (forcedType) => {
    let selected;
    if (forcedType && ENEMIES[forcedType]) {
      selected = ENEMIES[forcedType];
    } else {
      // Selección aleatoria de enemigo según su chance
      const entries = Object.entries(ENEMIES);
      const totalChance = entries.reduce((acc, [_, enemy]) => acc + (enemy.chance || 0), 0);
      let rand = Math.random() * totalChance;
      selected = entries[0][1];
      for (const [_, enemy] of entries) {
        rand -= enemy.chance || 0;
        if (rand <= 0) {
          selected = enemy;
          break;
        }
      }
    }
    enemyType.value = selected.type;
    enemyHealth.value = selected.health;
    enemyStrength.value = selected.strength;
    enemyDefense.value = selected.defense;
    // Iniciar combate
    console.log('⚔️ Encuentro iniciado con', selected.type);
    combatActive.value = true;
    playerTurn.value = true;
    combatMessage.value = t('combat.start');
  }
  const playerAttack = () => {
    console.log('🗡️ Ataque del jugador');
    // Lógica de ataque del jugador
    const result = performAttack(
      { attack: strength.value },
      { defense: enemyDefense.value }
    );

    console.log('damage:', result.damage);
    enemyHealth.value -= result.damage;

        if (result.missed) {
          combatMessage.value = t('combat.miss');
          soundStore.playSound('whosh');
        } else {
          soundStore.playSound('kling');
          if (result.isCritical) {
            combatMessage.value = t('combat.critical', { value: result.damage });
          } else {
            combatMessage.value = t('combat.hit', { value: result.damage });
          }
        }

    playerTurn.value = false;
    if( enemyHealth.value <= 0 ){
      enemyDefeated.value = true;
          combatMessage.value = t('combat.enemyDefeated');
      return;
    }

    setTimeout(enemyAttack, ENEMY_PAUSE);
    
  }

  const enemyAttack = () => {
    console.log('👹 Ataque del enemigo')
     const result = performAttack(
      { attack: enemyDefense.value },
      { defense: strength.value })

      console.log('damage:', result.damage);
      health.value -= result.damage
        if( result.missed ){
          combatMessage.value = t('combat.miss');
          soundStore.playSound('whosh');
        } else {
          soundStore.playSound('hammer');
          if( result.isCritical ){
            combatMessage.value = t('combat.critical', { value: result.damage });
          } else {
            combatMessage.value = t('combat.hit', { value: result.damage });
          }
        }

      if(health.value <= 0 ){
          combatMessage.value = t('combat.playerDefeated');
        setTimeout(() => {
          combatActive.value = false;
          gameOver.value = true;
        }, 1000);
        return
      }

    playerTurn.value = true;

  }

  const endCombat = () => {
    // Si el enemigo fue derrotado, márcalo en el mapa
    if (enemyDefeated.value && typeof position.value.x === 'number' && typeof position.value.y === 'number' && enemyType.value) {
      const poiStore = usePoiStore();
      poiStore.addDefeatedEnemy({
        x: position.value.x,
        y: position.value.y,
        offsetX: currentOffset.value.x,
        offsetY: currentOffset.value.y
      }, enemyType.value);
    }
    combatActive.value = false;
    enemyDefeated.value = false;
    lootCollected.value = false;
    combatMessage.value = '';
    // Reset enemy stats
    enemyHealth.value = undefined;
    enemyStrength.value = undefined;
    enemyDefense.value = undefined;
    enemyType.value = undefined;
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
    playerAttack,
    gameOver,
    wizardActive,
    enemyHealth,
    enemyStrength,
    enemyDefense,
    enemyType,
    playerTurn,
    combatMessage,
    coverActive,
    enemyDefeated,
    lootCollected,
    lastDirection,
    darkKnightDefeatedCount,
    enemyFrozen,
    playerFrozen,
    currentOffset,
    initialize,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    startCombat,
    endCombat,
    getTerrainColor,
    reset
  };
});
