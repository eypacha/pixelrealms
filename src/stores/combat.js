import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ENCOUNTER_RATE_DAY, ENCOUNTER_RATE_NIGHT, ENEMY_PAUSE, ENEMIES } from '../constants/enemies.js';
import { performAttack } from '../utilities/combatCalcs.js';
import { useSoundStore } from './sound.js';
import { usePoiStore } from './poi.js';
import { usePlayerStore } from './player.js';
import { COVER_DEFENSE_MULTIPLIER, COVER_DEFENSE_TURNS } from '../constants/player.js';

// Store responsable por toda la lógica relacionada con los encuentros/combat
export const useCombatStore = defineStore('combat', () => {
  const { t } = useI18n();

  const soundStore = useSoundStore();
  const poiStore = usePoiStore();

  // Combat state
  const combatActive = ref(false);
  const enemyHealth = ref(0);
  const enemyStrength = ref(10);
  const enemyDefense = ref(10);
  const enemyType = ref('orc');
  const combatMessage = ref('');
  const coverActive = ref(false);
  const coverTurns = ref(0);
  const enemyDefeated = ref(false);
  const lootCollected = ref(false);
  const playerTurn = ref(true);
  const enemyFrozen = ref(false);
  const playerFrozen = ref(false);
  const playerFleeing = ref(false);

  // Exposed helper to start a combat encounter
  const startCombat = (forcedType, playerStore) => {
    let selected;
    if (forcedType) {
      selected = ENEMIES.find(e => e.id === forcedType);
    } else {
      const available = ENEMIES.filter(e => {
        if (typeof e.minDefeated === 'number' && playerStore?.defeatedEnemiesCount < e.minDefeated) return false;
        if (typeof e.maxDefeated === 'number' && playerStore?.defeatedEnemiesCount > e.maxDefeated) return false;
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
    enemyFrozen.value = false;
    combatActive.value = true;
    playerTurn.value = true;
    combatMessage.value = t('combat.start');
    console.log('⚔️ Encuentro iniciado con', selected.type);
  };

  // The attack that the player performs: expects to receive the player store instance
  const playerAttack = (playerStore) => {
    if (!playerStore) playerStore = usePlayerStore();
    const result = performAttack({ attack: playerStore.strength }, { defense: enemyDefense.value });
    console.log('playerAttack damage:', result.damage);
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
      if (playerStore) playerStore.defeatedEnemiesCount++;
      return;
    }

    if (enemyFrozen.value) {
      maybeResetEnemyFrozen();
    } else {
      setTimeout(() => enemyAttack(playerStore), ENEMY_PAUSE);
    }
  };

  const activateCover = (playerStore) => {
    if (!playerTurn.value) return;
    if (!coverActive.value) {
      if (playerStore) playerStore.defense *= COVER_DEFENSE_MULTIPLIER;
      coverActive.value = true;
      coverTurns.value = COVER_DEFENSE_TURNS;
    }
    combatMessage.value = '🛡️ ' + t('combat.cover') + ` (x${COVER_DEFENSE_MULTIPLIER}, ${COVER_DEFENSE_TURNS} turns)`;
    soundStore.playSound('hammer');
    playerTurn.value = false;
    setTimeout(() => enemyAttack(playerStore), ENEMY_PAUSE);
  };

  const enemyAttack = (playerStore) => {
    if (!playerStore) playerStore = usePlayerStore();
    console.log('👹 Ataque del enemigo');
    const enemyData = ENEMIES.find(e => e.type === enemyType.value);

    // Freeze logic
    if (enemyData && enemyData.freezeChance) {
      if (!playerFrozen.value) {
        const freezeRoll = Math.random();
        if (freezeRoll < enemyData.freezeChance) {
          console.log('❄️ El enemigo ha congelado al jugador!');
          freezePlayer();
          return;
        }
      }
    }

    // Fireball special for some enemies
    if (enemyData && enemyData.fireballChance) {
      const fireballRoll = Math.random();
      if (fireballRoll < enemyData.fireballChance) {
        const fireballResult = performAttack({ attack: enemyStrength.value * 1.4 }, { defense: playerStore.defense });
        if (fireballResult.missed) {
          combatMessage.value = t('combat.fireballMissed');
          soundStore.playSound('whosh');
        } else {
          playerStore.health -= fireballResult.damage;
          combatMessage.value = t('combat.fireballHit', { value: fireballResult.damage });
          soundStore.playSound('fireball');
        }

        if (coverActive.value) {
          coverTurns.value -= 1;
          if (coverTurns.value <= 0) {
            playerStore.defense /= COVER_DEFENSE_MULTIPLIER;
            coverActive.value = false;
          }
        }

        if (playerStore.health <= 0) {
          combatMessage.value = t('combat.playerDefeated');
          setTimeout(() => {
            combatActive.value = false;
            playerStore.gameOver = true;
          }, 1000);
          return;
        }

        if (playerFrozen.value) {
          maybeResetPlayerFrozen();
          return;
        }

        if (playerFleeing.value) {
          console.log('🏃 El jugador ha huido del combate');
          endCombat(playerStore);
        }
        playerTurn.value = true;
        return;
      }
    }

    // Normal attack
    const result = performAttack({ attack: enemyStrength.value }, { defense: playerStore.defense });
    console.log('enemyAttack damage:', result.damage);

    if (Number.isFinite(playerStore.health) && Number.isFinite(result.damage)) {
      playerStore.health -= result.damage;
    } else {
      playerStore.health = 10;
    }

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

    if (coverActive.value) {
      coverTurns.value -= 1;
      if (coverTurns.value <= 0 && playerStore) {
        playerStore.defense /= COVER_DEFENSE_MULTIPLIER;
        coverActive.value = false;
      }
    }

    if (playerStore.health <= 0) {
      combatMessage.value = t('combat.playerDefeated');
      setTimeout(() => {
        combatActive.value = false;
        playerStore.gameOver = true;
      }, 1000);
      return;
    }

    if (playerFrozen.value) {
      maybeResetPlayerFrozen();
      return;
    }

    if (playerFleeing.value) {
      console.log('🏃 El jugador ha huido del combate');
      endCombat(playerStore);
    }

    playerTurn.value = true;
  };

  const fireballAttack = (playerStore) => {
    playerStore.mana -= 2;
    const result = performAttack({ attack: playerStore.strength * 1.4 }, { defense: enemyDefense.value });
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
      if (playerStore) playerStore.defeatedEnemiesCount++;
      return;
    }

    if (enemyFrozen.value) {
      maybeResetEnemyFrozen();
    } else {
      setTimeout(() => enemyAttack(playerStore), ENEMY_PAUSE);
    }
  };

  const freezeEnemy = (playerStore) => {
    if (playerStore) playerStore.mana -= 2;
    enemyHealth.value -= 1;
    enemyFrozen.value = true;
    combatMessage.value = t('combat.frozen');
    soundStore.playSound('freeze');
    playerTurn.value = true;
  };

  const freezePlayer = () => {
    playerFrozen.value = true;
    combatMessage.value = t('combat.playerFrozen');
    soundStore.playSound('freeze');
    setTimeout(() => {
      // enemy will attack after freeze pause
      enemyAttack();
    }, ENEMY_PAUSE);
  };

  const maybeResetEnemyFrozen = () => {
    enemyFrozen.value = Math.random() < 0.5 ? false : true;
    if (!enemyFrozen.value) {
      setTimeout(() => enemyAttack(), ENEMY_PAUSE);
    } else {
      combatMessage.value += ' ' + t('combat.enemyStillFrozen');
      playerTurn.value = true;
    }
  };

  const maybeResetPlayerFrozen = () => {
    playerFrozen.value = Math.random() < 0.5 ? false : true;
    if (!playerFrozen.value) {
      playerTurn.value = true;
    } else {
      combatMessage.value += ' ' + t('combat.playerStillFrozen');
      setTimeout(() => enemyAttack(), ENEMY_PAUSE);
    }
  };

  const usePotion = (playerStore) => {
    if (!playerStore.inventory) playerStore.inventory = { potion: 0 };
    playerStore.inventory.potion -= 1;
    if (Number.isFinite(playerStore.health) && Number.isFinite(playerStore.maxHealth)) {
      playerStore.health = Math.min(playerStore.maxHealth, playerStore.health + 5);
    } else {
      playerStore.health = 10;
    }
    combatMessage.value = t('combat.healed', { value: 5 });
    soundStore.playSound('gulp');
    playerTurn.value = false;

    if (enemyFrozen.value) {
      maybeResetEnemyFrozen();
    } else {
      setTimeout(() => enemyAttack(playerStore), ENEMY_PAUSE);
    }
  };

  const fleeCombat = (playerStore) => {
    if (enemyFrozen.value) {
      endCombat(playerStore);
    } else {
      playerFleeing.value = true;
      combatMessage.value = t('combat.fleeing');
      setTimeout(() => enemyAttack(playerStore), ENEMY_PAUSE);
    }
  };

  const endCombat = (playerStore) => {
    if (enemyDefeated.value && playerStore && typeof playerStore.position?.x === 'number' && typeof playerStore.position?.y === 'number' && enemyType.value) {
      poiStore.addDefeatedEnemy({ x: playerStore.position.x, y: playerStore.position.y, offsetX: playerStore.currentOffset?.x, offsetY: playerStore.currentOffset?.y }, enemyType.value);
    }

    combatActive.value = false;
    enemyDefeated.value = false;
    lootCollected.value = false;
    playerFleeing.value = false;
    playerTurn.value = false;
    combatMessage.value = '';

    enemyHealth.value = undefined;
    enemyStrength.value = undefined;
    enemyDefense.value = undefined;
    enemyType.value = undefined;

    if (coverActive.value && playerStore) {
      playerStore.defense /= COVER_DEFENSE_MULTIPLIER;
      coverActive.value = false;
      coverTurns.value = 0;
    }
  };

  return {
    combatActive,
    enemyHealth,
    enemyStrength,
    enemyDefense,
    enemyType,
    combatMessage,
    coverActive,
    coverTurns,
    enemyDefeated,
    lootCollected,
    playerTurn,
    enemyFrozen,
    playerFrozen,
    playerFleeing,
    startCombat,
    playerAttack,
    activateCover,
    enemyAttack,
    fireballAttack,
    freezeEnemy,
    freezePlayer,
    maybeResetEnemyFrozen,
    maybeResetPlayerFrozen,
    usePotion,
    fleeCombat,
    endCombat
  };
});
