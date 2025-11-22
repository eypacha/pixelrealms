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
            class="flex justify-center space-x-4 border-b-10 pt-4"
            :style="{ borderBottomColor: playerStore.getTerrainColor() }"
          >
            <div class="flex gap-2">
                <div class="mr-2">
                  <div class=" flex justify-between gap-1">
                    <span>❤️</span>
                    <span>{{ playerStore.health }}</span>
                  </div>
                  <div class=" flex justify-between gap-1">
                    <span>🗡️</span>
                    <span>{{ playerStore.strength }}</span>
                  </div>
                  <div class=" flex justify-between gap-1">
                    <span>🛡️</span>
                    <span>{{ playerStore.defense }}</span>
                  </div>
              </div>
              <div class="relative">
                <canvas ref="knightCanvas" width="60" height="80"></canvas>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="relative">
                <canvas ref="enemyCanvas" width="60" height="80"></canvas>
              </div>
              <div class="mr-2">
                  <div class=" flex justify-between gap-1">
                    <span>❤️</span>
                    <span>{{ playerStore.enemyHealth }}</span>
                  </div>
                  <div class=" flex justify-between gap-1">
                    <span>🗡️</span>
                    <span>{{ playerStore.enemyStrength }}</span>
                  </div>
                  <div class=" flex justify-between gap-1">
                    <span>🛡️</span>
                    <span>{{ playerStore.enemyDefense }}</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p class="p-2 mt-2 h-15">{{ playerStore.combatMessage }}</p>
        </div>
        <div v-if="!playerStore.enemyDefeated" class="mt-4 flex space-x-2 justify-center flex-wrap max-w-[320px] m-auto h-35">
          <div v-for="btn in combatButtons" :key="btn.label" class="flex flex-col items-center">
            <button
              @click="btn.onClick"
              :disabled="btn.disabled ? btn.disabled() : false"
              class="px-4 py-1 flex flex-col items-center"
              :class="[btn.disabled && btn.disabled() ? 'opacity-50 cursor-default' : 'cursor-pointer']"
            >
              <span style="font-size:1.5em;">{{ btn.emoji }}</span>
              {{ btn.label }}
            </button>
          </div>
        </div>
          <div v-else class="flex flex-col gap-2 items-center w-full mt-2">
            <div v-for="btn in lootButtons" :key="btn.key">
              <button
                v-if="btn.show()"
                @click="btn.onClick"
                :disabled="btn.claimed()"
                :class="['px-4 w-full mt-2 cursor-pointer text-black transition', btn.claimed() ? 'opacity-50' : '']"
              >
                {{ btn.label() }} <span v-if="btn.emoji" style="font-size:1.1em;">{{ btn.emoji }}</span>
              </button>
            </div>
            <button
              class="px-4 py-2 w-full mt-4 cursor-pointer text-black transition font-bold"
              @click="continueJourney()"
            >
              {{ $t('combat.continue') }}
            </button>
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

// Botones de combate para el template
const combatButtons = [
  { emoji: '🗡️', label: t('combat.attack'), onClick: swordAttack, disabled: () => !playerStore.playerTurn },
  { emoji: '🛡️', label: t('combat.cover'), onClick: cover, disabled: () => !playerStore.playerTurn },
  { emoji: '🧪', label: t('combat.heal'), onClick: usePotion, disabled: () => !playerStore.playerTurn || playerStore.inventory.potion <= 0 },
  { emoji: '🔥', label: t('combat.fireball'), onClick: fireball, disabled: () => !playerStore.playerTurn || playerStore.mana < 2 },
  { emoji: '❄️', label: t('combat.freeze'), onClick: freeze, disabled: () => !playerStore.playerTurn || playerStore.mana < 2 },
  { emoji: '🏃', label: t('combat.flee'), onClick: flee, disabled: () => !playerStore.playerTurn }
];

const lootButtons = [
  {
    key: 'coins',
    show: () => true,
    label: () => t('treasure.grabCoins', { coins: combatLoot.value.coins }),
    emoji: '🪙',
    claimed: () => combatLoot.value.coinsClaimed,
    onClick: claimCombatCoins
  },
  {
    key: 'potions',
    show: () => combatLoot.value.potions > 0,
    label: () => t('treasure.grabPotions', { potions: combatLoot.value.potions }),
    emoji: '🧪',
    claimed: () => combatLoot.value.potionsClaimed,
    onClick: claimCombatPotions
  },
  {
    key: 'scrolls',
    show: () => combatLoot.value.scrolls > 0,
    label: () => t('treasure.grabScroll', { scrolls: combatLoot.value.scrolls }) + ` (+${combatLoot.value.scrolls} 🪬)`,
    emoji: '',
    claimed: () => combatLoot.value.scrollClaimed,
    onClick: claimCombatScroll
  }
];
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

function continueJourney() {
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
  console.log('enemyFrozen changed:', isFrozen);
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