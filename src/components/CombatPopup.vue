<template>
  <!-- Eliminado div antiguo, solo queda el div con fondo dinámico -->
    <div
      class="absolute inset-0 flex justify-center items-center z-50 bg-[#00000040]"
    >
    <div class="flex flex-col bg-white w-100 h-100 p-5 text-center">
      <div class="flex-1 flex flex-col">
        <div :class="timeStore.isNight ? 'bg-blue-950 text-white' : 'bg-blue-100'">
          <h2 class="pt-4 flex align-center justify-center gap-3">
            <div class="w-32 text-right">
              <span v-if="playerStore.playerTurn">👉</span>
              {{ $t('characterSelect.characters.' + playerStore.character) }}
            </div>
            <div>
              {{ $t('combat.vs') }}
            </div>
            <div class="w-32 text-left">
              {{ $t('enemy.' + playerStore.enemyType) }}
                <span v-if="!playerStore.playerTurn">👈</span>
            </div>
          </h2>
          <div
            class="flex justify-center space-x-4 mb-4 border-b-4 pt-4"
            :style="{ borderBottomColor: playerStore.getTerrainColor() }"
          >
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
        </div>
        <div>
          <p class="p-2 h-15">{{ playerStore.combatMessage }}</p>
        </div>
        <div class="mt-4 flex space-x-2 justify-center flex-wrap max-w-[320px] m-auto h-35">
          <div class="flex flex-col items-center">
              <button @click="swordAttack" class="px-4 py-1 flex flex-col items-center cursor-pointer">
              <span style="font-size:1.5em;">🗡️</span>
              {{ $t('combat.attack') }}
            </button>
          </div>
          <div class="flex flex-col items-center">
              <button @click="cover" class="px-4 py-1 flex flex-col items-center cursor-pointer">
              <span style="font-size:1.5em;">🛡️</span>
              {{ $t('combat.cover') }}
            </button>
          </div>
          <div class="flex flex-col items-center">
              <button @click="usePotion" class="px-4 py-1 flex flex-col items-center cursor-pointer">
              <span style="font-size:1.5em;">🧪</span>
              {{ $t('combat.heal') }}
            </button>
          </div>
          <div class="flex flex-col items-center">
              <button @click="fireball" class="px-4 py-1 flex flex-col items-center cursor-pointer">
              <span style="font-size:1.5em;">🔥</span>
              {{ $t('combat.fireball') }}
            </button>
          </div>
          <div class="flex flex-col items-center">
              <button @click="freeze" class="px-4 py-1 flex flex-col items-center cursor-pointer">
              <span style="font-size:1.5em; color: #00bfff;">❄️</span>
              Freeze
            </button>
          </div>
          <div class="flex flex-col items-center">
              <button @click="flee" class="px-4 py-2 flex flex-col items-center cursor-pointer">
              <span style="font-size:1.5em;">🏃</span>
              {{ $t('combat.run') }}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, onMounted, watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useTimeStore } from '../stores/time';

import { useCombatDrawing } from '../composables/useCombatDrawing';
import { ENEMIES } from '../constants/enemies';

function freeze() {
  playerStore.freezeEnemy();
}

const playerStore = usePlayerStore();
  const timeStore = useTimeStore();
const { knightTint, knightFreezeTint, enemyTint, enemyFreezeTint, drawKnight, drawEnemy, loadImages, setEnemyType } = useCombatDrawing();

const knightCanvas = ref(null);
const enemyCanvas = ref(null);

function flee() {
  if (!playerStore.playerTurn) return
  playerStore.fleeCombat();
}

function swordAttack() {
  if (!playerStore.playerTurn) return
  playerStore.playerAttack();
}

function cover() {
  if (!playerStore.playerTurn) return
  playerStore.activateCover();
}

function usePotion() {
  if (!playerStore.playerTurn) return
  playerStore.usePotion();
}

function fireball() {
  if (!playerStore.playerTurn) return
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
    let coins = 0, potions = 0, scrolls = false;
    switch (playerStore.enemyType) {
      case 'darkknight':
        coins = Math.floor(Math.random() * 31) + 30; // 30-60
        potions = Math.floor(Math.random() * 3); // 0-2
        scrolls = 1; // 50%
        break;
      case 'goblin':
        coins = Math.floor(Math.random() * 10) + 1; // 1-10
        scrolls = 0; // 0
        potions = 1;
        break;
      case 'skeleton':
        coins = Math.floor(Math.random() * 40) + 20; // 20- 0
        potions = Math.floor(Math.random() * 5); // 0-4
        scrolls = Math.floor(Math.random() * 3) + 2; // 1-3
        break;
      case 'orc':
      default:
        coins = Math.floor(Math.random() * 10) + 5; // 5-14
        potions = Math.floor(Math.random() * 3); // 0-2
        scrolls = 0; // 0
        break;
    }
    combatLoot.value.coins = coins;
    combatLoot.value.potions = potions;
    combatLoot.value.scrolls = scrolls;
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
  if (!combatLoot.value.scrollClaimed && combatLoot.value.scrolls > 0) {
    playerStore.mana += combatLoot.value.scrolls;
    combatLoot.value.scrollClaimed = true;
    playerStore.lootCollected = true;
    playerStore.combatMessage = t('combat.lootedScroll', { scrolls: combatLoot.value.scrolls });
  }
}

function continueCombat() {
  playerStore.endCombat();
}

onMounted(() => {
  loadImages(knightCanvas, enemyCanvas, playerStore);
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

// Tinte celeste al jugador cuando está congelado
watch(() => playerStore.playerFrozen, (isFrozen) => {
  console.log('playerFrozen changed:', isFrozen);
  if (isFrozen) {
    knightTint.value = false;
    knightFreezeTint.value = true;
    drawKnight(knightCanvas);
  } else {
    knightFreezeTint.value = false;
    drawKnight(knightCanvas);
  }
});

watch(() => playerStore.image, (newImg) => {
  if (newImg && knightCanvas.value) {
    const img = new Image();
    img.onload = () => {
      const ctx = knightCanvas.value.getContext('2d');
      ctx.clearRect(0, 0, 60, 80);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 60, 80);
    };
    img.src = newImg;
  }
});
</script>