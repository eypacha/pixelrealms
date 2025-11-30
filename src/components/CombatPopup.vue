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
              <span v-if="combatStore.playerTurn">👉</span>
              {{ $t('characterSelect.characters.' + playerStore.character) }}
            </div>
            <div>
              {{ $t('combat.vs') }}
            </div>
            <div class="w-32 text-left">
              {{ $t('enemy.' + combatStore.enemyType) }}
                <span v-if="!combatStore.playerTurn">👈</span>
            </div>
          </h2>
          <div
            class="flex justify-center space-x-4 border-b-10 pt-4"
            :style="{ borderBottomColor: playerStore.getTerrainColor() }"
          >
            <div class="flex gap-2">
                <div class="mr-2">
                  <div class=" flex justify-between gap-1">
                    <span>🗡️</span>
                    <span>{{ Math.floor(playerStore.strength) }}</span>
                  </div>
                  <div class=" flex justify-between gap-1">
                    <span>🛡️</span>
                    <span>{{ Math.floor(playerStore.defense) }}</span>
                  </div>
                  <div class=" flex justify-between gap-1">
                    <span>❤️</span>
                    <span>{{ Math.floor(playerStore.health) }}</span>
                  </div>
              </div>
              <div class="relative">
                <canvas ref="knightCanvas" width="60" height="80"></canvas>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="relative">
                <canvas
                  ref="enemyCanvas"
                  :width="enemyWidth"
                  :height="enemyHeight"
                  style="display:block;"
                ></canvas>
              </div>
              <div class="mr-2">
                  <div class=" flex justify-between gap-1">
                    <span>🗡️</span>
                    <span>{{ Math.floor(combatStore.enemyStrength) }}</span>
                  </div>
                  
                  <div class=" flex justify-between gap-1">
                    <span>🛡️</span>
                    <span>{{ Math.floor(combatStore.enemyDefense) }}</span>
                  </div>
                  <div class=" flex justify-between gap-1">
                    <span>❤️</span>
                    <span>{{ Math.floor(combatStore.enemyHealth) }}</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p class="p-2 mt-2 h-15">{{ combatStore.combatMessage }}</p>
        </div>
        <div v-if="!combatStore.enemyDefeated" class="mt-4 flex space-x-2 justify-center flex-wrap max-w-[320px] m-auto h-35">
          <div v-for="btn in combatButtons" :key="btn.label" class="flex flex-col items-center">
            <button
              @click="btn.onClick"
              :disabled="btn.disabled ? btn.disabled() : false"
              class="px-4 py-1 flex flex-col items-center w-22"
              :class="[btn.disabled && btn.disabled() ? 'opacity-50 cursor-default' : 'cursor-pointer']"
            >
              <span class="text-lg">{{ btn.emoji }}</span>
              <span class="leading-none">{{ btn.label }}</span>
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
import { ref, onMounted, computed, watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useCombatStore } from '../stores/combat';
import { useTimeStore } from '../stores/time';
import { useI18n } from 'vue-i18n';
import { useCombatDrawing } from '../composables/useCombatDrawing';
import { ENEMIES } from '../constants/enemies';

const playerStore = usePlayerStore();
const combatStore = useCombatStore();
const timeStore = useTimeStore();

const enemyData = computed(() => ENEMIES.find(e => e.type === combatStore.enemyType));
const enemyWidth = computed(() => {
  const enemy = enemyData.value;
  return enemy && enemy.width ? enemy.width : 60;
});
const enemyHeight = computed(() => {
  const enemy = enemyData.value;
  return enemy && enemy.height ? enemy.height : 80;
});

const { t } = useI18n();

function freeze() {
  combatStore.freezeEnemy(playerStore);
}

// playerStore already declared above
const { knightTint, knightFreezeTint, enemyTint, enemyFreezeTint, drawKnight, drawEnemy, loadImages, setEnemyType } = useCombatDrawing();

const knightCanvas = ref(null);
const enemyCanvas = ref(null);

function flee() {
  if (!combatStore.playerTurn) return
  combatStore.fleeCombat(playerStore);
}

function swordAttack() {
  if (!combatStore.playerTurn) return
  combatStore.playerAttack(playerStore);
}

function cover() {
  if (!combatStore.playerTurn) return
  combatStore.activateCover(playerStore);
}

function usePotion() {
  if (!combatStore.playerTurn) return
  combatStore.usePotion(playerStore);
}

function fireball() {
  if (!combatStore.playerTurn) return
  combatStore.fireballAttack(playerStore);
}

// Botones de combate para el template
const combatButtons = [
  { emoji: '🗡️', label: t('combat.attack'), onClick: swordAttack, disabled: () => !combatStore.playerTurn },
  { emoji: '🛡️', label: t('combat.cover'), onClick: cover, disabled: () => !combatStore.playerTurn },
  { emoji: '🧪', label: t('combat.heal'), onClick: usePotion, disabled: () => !combatStore.playerTurn || playerStore.inventory.potion <= 0 },
  { emoji: '🔥', label: t('combat.fireball'), onClick: fireball, disabled: () => !combatStore.playerTurn || playerStore.mana < 2 },
  { emoji: '❄️', label: t('combat.freeze'), onClick: freeze, disabled: () => !combatStore.playerTurn || playerStore.mana < 2 },
  { emoji: '🏃', label: t('combat.flee'), onClick: flee, disabled: () => !combatStore.playerTurn }
];

const lootButtons = [
  {
    key: 'coins',
    show: () => combatLoot.value.coins > 0,
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
  if (combatStore.enemyDefeated && !combatStore.lootCollected) {
    const enemy = ENEMIES.find(e => e.type === combatStore.enemyType);
    const lootFn = enemy?.loot;
    const loot = lootFn ? lootFn() : { coins: 0, potions: 0, scrolls: 0 };
    combatLoot.value.coins = loot.coins;
    combatLoot.value.potions = loot.potions;
    combatLoot.value.scrolls = loot.scrolls;
    combatLoot.value.coinsClaimed = false;
    combatLoot.value.potionsClaimed = false;
    combatLoot.value.scrollClaimed = false;
  }
}

function claimCombatCoins() {
  if (!combatLoot.value.coinsClaimed) {
    playerStore.coins += combatLoot.value.coins;
    combatLoot.value.coinsClaimed = true;
    combatStore.lootCollected = true;
    combatStore.combatMessage = t('combat.looted', { coins: combatLoot.value.coins });
  }
}

function claimCombatPotions() {
  if (!combatLoot.value.potionsClaimed) {
    if (!playerStore.inventory.potion) playerStore.inventory.potion = 0;
    playerStore.inventory.potion += combatLoot.value.potions;
    combatLoot.value.potionsClaimed = true;
    combatStore.lootCollected = true;
    combatStore.combatMessage = t('combat.lootedPotion');
  }
}

function claimCombatScroll() {
  if (!combatLoot.value.scrollClaimed && combatLoot.value.scrolls > 0) {
    playerStore.mana += combatLoot.value.scrolls;
    combatLoot.value.scrollClaimed = true;
    combatStore.lootCollected = true;
    combatStore.combatMessage = t('combat.lootedScroll', { scrolls: combatLoot.value.scrolls });
  }
}

function continueJourney() {
  combatStore.endCombat(playerStore);
}

onMounted(() => {
  loadImages(knightCanvas, enemyCanvas, playerStore, combatStore);
  if (combatStore.enemyType) {
    setEnemyType(combatStore.enemyType, enemyCanvas, combatStore.enemyDefeated);
  }
  watch(() => combatStore.enemyDefeated, (v) => {
    if (combatStore.enemyType) {
      setEnemyType(combatStore.enemyType, enemyCanvas, v);
    }
    if (v) setupCombatLoot();
    console.log('DEBUG: enemyDefeated ->', v);
  });
});

watch(() => combatStore.enemyType, (type) => {
  if (type) setEnemyType(type, enemyCanvas, combatStore.enemyDefeated);
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

watch(() => combatStore.enemyHealth, (newVal, oldVal) => {
  if (newVal < oldVal) {
    enemyTint.value = true;
    drawEnemy(enemyCanvas, combatStore.enemyType, combatStore.enemyDefeated);
    setTimeout(() => {
      enemyTint.value = false;
      drawEnemy(enemyCanvas, combatStore.enemyType, combatStore.enemyDefeated);
    }, 100);
  }
});

watch(() => combatStore.enemyFrozen, (isFrozen) => {
  console.log('enemyFrozen changed:', isFrozen);
  if (isFrozen) {
    enemyTint.value = false;
    enemyFreezeTint.value = true;
    drawEnemy(enemyCanvas, combatStore.enemyType, combatStore.enemyDefeated);
  } else {
    enemyFreezeTint.value = false;
    drawEnemy(enemyCanvas, combatStore.enemyType, combatStore.enemyDefeated);
  }
});

// Tinte celeste al jugador cuando está congelado
watch(() => combatStore.playerFrozen, (isFrozen) => {
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