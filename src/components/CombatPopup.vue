<template>
  <div class="absolute inset-0 bg-[#00000020] flex justify-center items-center z-50">
    <div class="flex flex-col bg-white w-100 h-80 p-5 text-center">
      <div class="flex-1">
        <h2>VS</h2>
        <div class="flex justify-center space-x-4 mb-4 border-b-4" :style="{ borderBottomColor: playerStore.getTerrainColor() }">
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
        <p v-if="!playerStore.enemyDefeated" class="font-bold">{{ playerStore.playerTurn ? 'Your turn' : 'Enemy turn' }}</p>
      </div>
      <div class="mt-4 flex space-x-2 justify-center">
        <template v-if="!playerStore.enemyDefeated">
          <button @click="swordAttack" :disabled="!playerStore.playerTurn" class="px-4 py-2 cursor-pointer" :class="{ 'opacity-50': !playerStore.playerTurn }">Atack</button>
          <button @click="cover" :disabled="!playerStore.playerTurn" class="px-4 py-2 cursor-pointer" :class="{ 'opacity-50': !playerStore.playerTurn }">Cover</button>
          <button @click="usePotion" :disabled="!playerStore.playerTurn || playerStore.inventory.potion <= 0" class="px-4 py-2 cursor-pointer" :class="{ 'opacity-50': !playerStore.playerTurn || playerStore.inventory.potion <= 0 }">Heal</button>
          <button @click="flee" class="px-4 py-2 cursor-pointer">Run</button>
        </template>
        <template v-else>
          <button @click="loot" :disabled="playerStore.lootCollected" class="px-4 py-2 cursor-pointer" :class="{ 'opacity-50': playerStore.lootCollected }">{{ playerStore.lootCollected ? 'Looted' : 'Loot' }}</button>
          <button @click="continueCombat" class="px-4 py-2 cursor-pointer">Continue</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useCombatDrawing } from '../composables/useCombatDrawing';

const playerStore = usePlayerStore();
const { knightTint, enemyTint, drawKnight, drawEnemy, loadImages, setEnemyType } = useCombatDrawing();

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
  // Delegar la lógica al store para que el boost persista hasta el ataque enemigo
  playerStore.activateCover();
}

function usePotion() {
  playerStore.usePotion();
}

function loot() {
  // collect loot only when enemyDefeated
  const result = playerStore.collectLoot();
  if (result && typeof result === 'object') {
    let msg = `Looted +${result.coins} coins`;
    if (result.potion) msg += ' and +1 potion';
    playerStore.combatMessage = msg;
  } else if (playerStore.lootCollected) {
    playerStore.combatMessage = 'Already looted';
  }
}

function continueCombat() {
  // end combat and close popup
  playerStore.endCombat();
}

onMounted(() => {
  loadImages(knightCanvas, enemyCanvas);
  // set initial enemy image according to store (in case combat already started)
  if (playerStore.enemyType) {
    setEnemyType(playerStore.enemyType, enemyCanvas);
  }
  // debug: log enemyDefeated changes
  // Helpful to verify the store flag updates when enemy dies
  watch(() => playerStore.enemyDefeated, (v) => {
    console.log('DEBUG: enemyDefeated ->', v);
  });
});

// Watch for enemy type changes to switch sprite
watch(() => playerStore.enemyType, (type) => {
  if (type) setEnemyType(type, enemyCanvas);
});

// Watch for health changes to apply red tint
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
</script>