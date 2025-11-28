import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePoiStore } from './poi.js';
import { ref } from 'vue';
import {
    PLAYER_SPEED,
    RECOVERY_STEPS,
  } from '../constants/player.js';

import {
  ENCOUNTER_RATE_DAY,
  ENCOUNTER_RATE_NIGHT,
  ENEMY_PAUSE,
  ENEMIES,
} from '../constants/enemies.js';

import { useTimeStore } from './time.js';

import { createSeededRandom } from '../utilities/randomWithSeed.js';
import { getColorForHeight } from '../utilities/draw.js';
import { useSoundStore } from './sound.js';
import { performAttack } from '../utilities/combatCalcs.js';

const COVER_DEFENSE_MULTIPLIER = 1.5; 
const COVER_DEFENSE_TURNS = 2;

export const usePlayerStore = defineStore('player', () => {

  const soundStore = useSoundStore();
  const timeStore = useTimeStore();
  const poiStore = usePoiStore();

  // Imágenes de los canvas para Game Over
  const terrainImage = ref(null);
  const reactiveImage = ref(null);

  const { t } = useI18n();

  const seed = ref(Date.now());

  const position = ref({ x: 0, y: 0 });
  const oldPosition = ref({ x: 0, y: 0 });
  const health = ref(null);
  const maxHealth = ref(null);
  const strength = ref(null);
  const defense = ref(null);
  const coins = ref(null);
  const inventory = ref({ potion: 0 });

  const steps = ref(0);
  const mana = ref(0);

  const combatActive = ref(false);
  const enemyHealth = ref(undefined);
  const enemyStrength = ref(undefined);
  const enemyDefense = ref(undefined);
  const enemyType = ref(undefined);
  const combatMessage = ref('');
  const coverActive = ref(false);
  const coverTurns = ref(0);
  const enemyDefeated = ref(false);
  const lootCollected = ref(false);
  const gameOver = ref(false);

  const wizardActive = ref(false);
  const playerTurn = ref(true);
  const lastDirection = ref('down');
  const darkKnightDefeatedCount = ref(0);
  const defeatedEnemiesCount = ref(0); // Nuevo contador total
  const enemyFrozen = ref(false);
  const playerFrozen = ref(false);
  const playerFleeing = ref(false);
  
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
        // Revelar POIs cercanos al jugador al iniciar
        poiStore.revealPoi(position.value)
        return;
      }
      attempts++;
    }
    // Si no encuentra tierra, dejar en (0,0)
    position.value = { x: 0, y: 0 };
    oldPosition.value = { ...position.value };
    
    poiStore.revealPoi(position.value);

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
    // Guardar la posición visitada como POI tipo 'step'
    poiStore.addStepPoi(position.value);
    poiStore.revealPoi(position.value); 
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
    if (forcedType) {
      selected = ENEMIES.find(e => e.id === forcedType);
    } else {
      // Filtrar enemigos según minDefeated y maxDefeated
      const available = ENEMIES.filter(e => {
        if (typeof e.minDefeated === 'number' && defeatedEnemiesCount.value < e.minDefeated) return false;
        if (typeof e.maxDefeated === 'number' && defeatedEnemiesCount.value > e.maxDefeated) return false;
        return (e.baseProbability || 0) > 0;
      });
      const totalProb = available.reduce((sum, e) => sum + (e.baseProbability || 0), 0);
      let rand = Math.random() * totalProb;
      selected = available[0];
      for (const enemy of available) {
        rand -= enemy.baseProbability || 0;
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
      // Resetear congelación visual y lógica
      enemyFrozen.value = false;
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
    if (enemyHealth.value <= 0) {
      enemyDefeated.value = true;
      combatMessage.value = t('combat.enemyDefeated');
      defeatedEnemiesCount.value++;
      return;
    }

    if(enemyFrozen.value) {
      maybeResetEnemyFrozen();
    } else {
      setTimeout(enemyAttack, ENEMY_PAUSE);
    }
  }

  // Cover: activa defensa extra para el próximo ataque enemigo
  const activateCover = () => {
    if (!playerTurn.value) return;
    if (!coverActive.value) {
      defense.value *= COVER_DEFENSE_MULTIPLIER;
      coverActive.value = true;
      coverTurns.value = COVER_DEFENSE_TURNS;
    }
    combatMessage.value = '🛡️ ' + t('combat.cover') + ` (x${COVER_DEFENSE_MULTIPLIER}, ${COVER_DEFENSE_TURNS} turns)`;
    soundStore.playSound('hammer');
    playerTurn.value = false;
    setTimeout(enemyAttack, ENEMY_PAUSE);
  }

  const enemyAttack = () => {
    console.log('👹 Ataque del enemigo');
        const enemyData = ENEMIES[enemyType.value];
        if (enemyData && enemyData.freezeChance) {
          if (!playerFrozen.value && Math.random() < enemyData.freezeChance) {
            console.log('❄️ El enemigo ha congelado al jugador!');
            freezePlayer();
            return;
          }
        }

        const result = performAttack(
          { attack: enemyDefense.value },
          { defense: defense.value }
        );

        console.log('damage:', result.damage);
        health.value -= result.damage;
        if (result.missed) {
          combatMessage.value = t('combat.miss');
          soundStore.playSound('whosh');
        } else {
          soundStore.playSound('hammer');
          if (result.isCritical) {
            combatMessage.value = t('combat.critical', { value: result.damage });
          } else {
            combatMessage.value = t('combat.hit', { value: result.damage });
          }
        }

        // Consumir el cover y restaurar defense
        if (coverActive.value) {
          coverTurns.value -= 1;
          if (coverTurns.value <= 0) {
            defense.value /= COVER_DEFENSE_MULTIPLIER;
            coverActive.value = false;
          }
        }

        if (health.value <= 0) {
          combatMessage.value = t('combat.playerDefeated');
          setTimeout(() => {
            combatActive.value = false;
            gameOver.value = true;
          }, 1000);
          return;
        }

        if(playerFrozen.value) {
          maybeResetPlayerFrozen();
          return;
        }

        if (playerFleeing.value) {
          console.log('🏃 El jugador ha huido del combate')
          endCombat();
        }
          
         playerTurn.value = true;

  }


  // Fireball: ataque especial con +3 a strength, consume 2 mana
  const fireballAttack = () => {
    mana.value -= 2;
    // Ataque con fuerza aumentada
    const result = performAttack(
      { attack: strength.value },
      { defense: enemyDefense.value - 5}
    );
    if (result.missed) {
      combatMessage.value = t('combat.fireballMissed');
      soundStore.playSound('whosh');
    } else {
      enemyHealth.value -= result.damage;
      combatMessage.value = t('combat.fireballHit', { value: result.damage });
      soundStore.playSound('fireball');
    }
    playerTurn.value = false;
    if (enemyHealth.value <= 0) {
      enemyDefeated.value = true;
      combatMessage.value = t('combat.enemyDefeated');
      defeatedEnemiesCount.value++;
      return;
    }

    if(enemyFrozen.value) {
      maybeResetEnemyFrozen();
    } else {
      setTimeout(enemyAttack, ENEMY_PAUSE);
    }
  }


  const freezeEnemy = () => {
    mana.value -= 2;
    enemyHealth.value -= 1;
    enemyFrozen.value = true;
    combatMessage.value = t('combat.frozen');
    soundStore.playSound('freeze');
    playerTurn.value = true;
  }

  const freezePlayer = () => {
    playerFrozen.value = true;
    combatMessage.value = t('combat.playerFrozen');
    soundStore.playSound('freeze');
    setTimeout(enemyAttack, ENEMY_PAUSE);
  }

  const maybeResetEnemyFrozen = () => {

    console.log('❄️ Comprobando si el enemigo sigue congelado');
    enemyFrozen.value = Math.random() < 0.5 ? false : true;

    if(!enemyFrozen.value) {
      console.log('El enemigo se ha descongelado');
    
      setTimeout(enemyAttack, ENEMY_PAUSE);
    } else {
      console.log('El enemigo sigue congelado');
      combatMessage.value += ' ' + t('combat.enemyStillFrozen');
      playerTurn.value = true;
    }
  }

  const maybeResetPlayerFrozen = () => {
    console.log('❄️ Comprobando si el jugador sigue congelado');
    playerFrozen.value = Math.random() < 0.5 ? false : true;

    if(!playerFrozen.value) {
      console.log('El jugador se ha descongelado');
    
      playerTurn.value = true;
    } else {
      console.log('El jugador sigue congelado');
      combatMessage.value += ' ' + t('combat.playerStillFrozen');
      setTimeout(enemyAttack, ENEMY_PAUSE);
    }
  }

  const usePotion = () => {
      inventory.value.potion -= 1;
      health.value = Math.min(maxHealth.value, health.value + 5);
      combatMessage.value = t('combat.healed', { value: 5 });
      soundStore.playSound('gulp');
      playerTurn.value = false;

      if(enemyFrozen.value) {
        maybeResetEnemyFrozen();
      } else {
        setTimeout(enemyAttack, ENEMY_PAUSE);
      }
  }
  const fleeCombat = () => {
    console.log('🏃 Huir del combate');
    
     if(enemyFrozen.value) {
        endCombat();
      } else {
        playerFleeing.value = true;
        combatMessage.value = t('combat.fleeing');
        setTimeout(enemyAttack, ENEMY_PAUSE);
      }
  }

  const endCombat = () => {
    console.log('🏳️ Fin del combate');
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
    playerFleeing.value = false;
    playerTurn.value = false;
    combatMessage.value = '';
    // Reset enemy stats
    enemyHealth.value = undefined;
    enemyStrength.value = undefined;
    enemyDefense.value = undefined;
    enemyType.value = undefined;
    // Reset cover
    if (coverActive.value) {
      defense.value /= COVER_DEFENSE_MULTIPLIER;
      coverActive.value = false;
      coverTurns.value = 0;
    }
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
    activateCover,
    fireballAttack,
    freezeEnemy,
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
    defeatedEnemiesCount,
    enemyFrozen,
    playerFrozen,
    currentOffset,
    initialize,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    startCombat,
    fleeCombat,
    usePotion,
    endCombat,
    getTerrainColor,
    reset
  };
});
