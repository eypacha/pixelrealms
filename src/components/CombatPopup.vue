<template>
  <div class="absolute inset-0 bg-[#00000020] flex justify-center items-center z-50">
    <div class="flex flex-col bg-white w-100 h-100 p-5 text-center">
      <div class="flex-1">
        <h2>{{ $t('combat.vs') }}</h2>
        <div class="flex justify-center space-x-4 mb-4 border-b-4"
          :style="{ borderBottomColor: playerStore.getTerrainColor() }">
          <div class="flex gap-2">
            <div>
              <div>❤️ {{ playerStore.health }}</div>
              <div>🗡️ {{ playerStore.strength }}</div>
              <div>🛡️ {{ playerStore.defense }}</div>
            </div>
            <div class="relative">
              <canvas ref="knightCanvas" width="60" height="80"></canvas>
            </div>
          </div>
          <div class="flex gap-2">
            <div class="relative">
              <canvas ref="enemyCanvas" width="60" height="80"></canvas>
            </div>
            <div>
              <div>❤️ {{ playerStore.enemyHealth }}</div>
              <div>🗡️ {{ playerStore.enemyStrength }}</div>
              <div>🛡️ {{ playerStore.enemyDefense }}</div>
            </div>
          </div>
        </div>
        <p>{{ playerStore.combatMessage }}</p>
        <p v-if="!playerStore.enemyDefeated" class="font-bold">{{ playerStore.playerTurn ? $t('combat.yourTurn') :
          $t('combat.enemyTurn') }}</p>
      </div>
      <div class="mt-4 flex space-x-2 justify-center flex-wrap max-w-[320px] m-auto">
        <template v-if="!playerStore.enemyDefeated">
          <div class="flex flex-col items-center">
            <button @click="swordAttack" :disabled="!playerStore.playerTurn"
              class="px-4 py-1 cursor-pointer flex flex-col items-center"
              :class="{ 'opacity-50': !playerStore.playerTurn }">
              <span style="font-size:1.5em;">🗡️</span>
              {{ $t('combat.attack') }}
            </button>
          </div>
          <div class="flex flex-col items-center">
            <button @click="cover" :disabled="!playerStore.playerTurn"
              class="px-4 py-1 cursor-pointer flex flex-col items-center"
              :class="{ 'opacity-50': !playerStore.playerTurn }">
              <span style="font-size:1.5em;">🛡️</span>
              {{ $t('combat.cover') }}
            </button>
          </div>
          <div class="flex flex-col items-center">
            <button @click="usePotion" :disabled="!playerStore.playerTurn || playerStore.inventory.potion <= 0"
              class="px-4 py-1 cursor-pointer flex flex-col items-center"
              :class="{ 'opacity-50': !playerStore.playerTurn || playerStore.inventory.potion <= 0 }">
              <span style="font-size:1.5em;">🧪</span>
              {{ $t('combat.heal') }}
            </button>
          </div>
          <div class="flex flex-col items-center">
            <button @click="fireball" :disabled="!playerStore.playerTurn || playerStore.mana < 1"
              class="px-4 py-1 cursor-pointer flex flex-col items-center"
              :class="{ 'opacity-50': !playerStore.playerTurn || playerStore.mana < 1 }">
              <span style="font-size:1.5em;">🔥</span>
              {{ $t('combat.fireball') }}
            </button>
          </div>
          <div class="flex flex-col items-center">
            <button @click="freeze" :disabled="!playerStore.playerTurn || playerStore.mana < 2"
              class="px-4 py-1 cursor-pointer flex flex-col items-center"
              :class="{ 'opacity-50': !playerStore.playerTurn || playerStore.mana < 2 }">
              <span style="font-size:1.5em; color: #00bfff;">❄️</span>
              Freeze
            </button>
          </div>
          <div class="flex flex-col items-center">
            <button @click="flee" class="px-4 py-2 cursor-pointer flex flex-col items-center">
              <span style="font-size:1.5em;">🏃</span>
              {{ $t('combat.run') }}
            </button>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col gap-2 items-center w-full mt-2">
            <button @click="claimCombatCoins" :disabled="combatLoot.coinsClaimed"
              :class="['px-4 w-full mt-2 cursor-pointer text-black transition', combatLoot.coinsClaimed ? 'opacity-50' : '']">
              {{ $t('treasure.grabCoins', { coins: combatLoot.coins }) }} <span style="font-size:1.1em;">🪙</span>
            </button>
            <button v-if="combatLoot.potions > 0" @click="claimCombatPotions" :disabled="combatLoot.potionsClaimed"
              :class="['px-4 w-full mt-2 cursor-pointer text-black transition', combatLoot.potionsClaimed ? 'opacity-50' : '']">
              {{ $t('treasure.grabPotions', { potions: combatLoot.potions }) }} <span style="font-size:1.1em;">🧪</span>
            </button>
            <button v-if="combatLoot.scrollFound" @click="claimCombatScroll" :disabled="combatLoot.scrollClaimed"
              :class="['px-4 w-full mt-2 cursor-pointer text-black transition', combatLoot.scrollClaimed ? 'opacity-50' : '']">
              {{ $t('treasure.grabScroll') }} (<span style="font-size:1.1em;">+1 🪬</span>)
            </button>
          </div>
          <button @click="continueCombat" class="px-4 py-2 w-full mt-4 cursor-pointer">{{ $t('treasure.continue')
            }}</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, onMounted, watch } from 'vue';
import { usePlayerStore } from '../stores/player';

import { useCombatDrawing } from '../composables/useCombatDrawing';
import { DARK_KNIGHT, GOBLIN, ORC } from '../constants/enemies';

function freeze() {
  playerStore.freezeEnemy();
}

const playerStore = usePlayerStore();
const { knightTint, enemyTint, enemyFreezeTint, drawKnight, drawEnemy, loadImages, setEnemyType } = useCombatDrawing();

const knightCanvas = ref(null);
const enemyCanvas = ref(null);

function flee() {
  playerStore.fleeCombat();
}

function swordAttack() {
  if (playerStore.playerTurn) {
    playerStore.playerAttack(playerStore.strength);
  }
}

function cover() {
  playerStore.activateCover();
}

function usePotion() {
  playerStore.usePotion();
}

function fireball() {
  playerStore.fireballAttack();
}

// Combat loot state and logic
const combatLoot = ref({
  coins: 0,
  potions: 0,
  scrollFound: false,
  coinsClaimed: false,
  potionsClaimed: false,
  scrollClaimed: false
});

function setupCombatLoot() {
  if (playerStore.enemyDefeated && !playerStore.lootCollected) {
    let coins = 0, potions = 0, scrollFound = false;
    switch (playerStore.enemyType) {
      case DARK_KNIGHT:
        coins = Math.floor(Math.random() * 21) + 15; // 15-35
        potions = Math.random() < 0.5 ? 1 : 0; // 50% chance
        scrollFound = Math.random() < 0.5; // 50%
        break;
      case GOBLIN:
        coins = Math.floor(Math.random() * 5) + 1; // 1-5
        scrollFound = false; // Orcs do not drop scrolls
        break;
      case ORC:
      default:
        coins = Math.floor(Math.random() * 10) + 1; // 1-10
        scrollFound = Math.random() < 0.1; // 10% chance for ORC
        break;
    }
    combatLoot.value.coins = coins;
    combatLoot.value.potions = potions;
    combatLoot.value.scrollFound = scrollFound;
    combatLoot.value.coinsClaimed = false;
    combatLoot.value.potionsClaimed = false;
    combatLoot.value.scrollClaimed = false;
  }
}

function claimCombatCoins() {
  if (!combatLoot.value.coinsClaimed) {
    playerStore.coins += combatLoot.value.coins;
    combatLoot.value.coinsClaimed = true;
    playerStore.lootCollected = true;
    playerStore.combatMessage = t('combat.looted', { coins: combatLoot.value.coins });
  }
}

function claimCombatPotions() {
  if (!combatLoot.value.potionsClaimed) {
    if (!playerStore.inventory.potion) playerStore.inventory.potion = 0;
    playerStore.inventory.potion += combatLoot.value.potions;
    combatLoot.value.potionsClaimed = true;
    playerStore.lootCollected = true;
    playerStore.combatMessage = t('combat.lootedPotion');
  }
}

function claimCombatScroll() {
  if (!combatLoot.value.scrollClaimed && combatLoot.value.scrollFound) {
    playerStore.mana += 1;
    combatLoot.value.scrollClaimed = true;
    playerStore.lootCollected = true;
    playerStore.combatMessage = t('combat.lootedScroll');
  }
}

function continueCombat() {
  playerStore.endCombat();
}

onMounted(() => {
  loadImages(knightCanvas, enemyCanvas);
  if (playerStore.enemyType) {
    setEnemyType(playerStore.enemyType, enemyCanvas);
  }
  watch(() => playerStore.enemyDefeated, (v) => {
    if (v) setupCombatLoot();
    console.log('DEBUG: enemyDefeated ->', v);
  });
});

watch(() => playerStore.enemyType, (type) => {
  if (type) setEnemyType(type, enemyCanvas);
});

watch(() => playerStore.health, (newVal, oldVal) => {
  if (newVal < oldVal) {
    knightTint.value = true;
    drawKnight(knightCanvas);
    setTimeout(() => {
      knightTint.value = false;
      drawKnight(knightCanvas);
    }, 100);
  }
});

watch(() => playerStore.enemyHealth, (newVal, oldVal) => {
  if (newVal < oldVal) {
    enemyTint.value = true;
    drawEnemy(enemyCanvas);
    setTimeout(() => {
      enemyTint.value = false;
      drawEnemy(enemyCanvas);
    }, 100);
  }
});

watch(() => playerStore.enemyFrozen, (isFrozen) => {
  if (isFrozen) {
    enemyTint.value = false;
    enemyFreezeTint.value = true;
    drawEnemy(enemyCanvas);
  } else {
    enemyFreezeTint.value = false;
    drawEnemy(enemyCanvas);
  }
});
</script>