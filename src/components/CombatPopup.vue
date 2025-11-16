<template>
  <div class="absolute inset-0 bg-[#00000020] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center">
      <h2>VS</h2>
      <div class="flex justify-center space-x-4 mb-4 border-b-4" :style="{ borderBottomColor: playerStore.getTerrainColor() }">
        <div class="flex gap-2">
          <div>
            <div>❤️ {{ playerStore.health }}</div>
            <div>💪 {{ playerStore.strength }}</div>
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
            <div>💪 {{ playerStore.enemyStrength }}</div>
            <div>🛡️ {{ playerStore.enemyDefense }}</div>
          </div>
        </div>
      </div>
      <p>{{ playerStore.combatMessage }}</p>
      <p class="font-bold">{{ playerStore.playerTurn ? 'Your turn' : 'Enemy turn' }}</p>
      <div class="mt-4 flex space-x-2">
        <button @click="swordAttack" :disabled="!playerStore.playerTurn" class="px-4 py-2 cursor-pointer" :class="{ 'opacity-50': !playerStore.playerTurn }">Atack</button>
        <button @click="cover" :disabled="!playerStore.playerTurn" class="px-4 py-2 cursor-pointer" :class="{ 'opacity-50': !playerStore.playerTurn }">Cover</button>
        <button @click="flee" class="px-4 py-2 cursor-pointer">Run</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useCombatDrawing } from '../composables/useCombatDrawing';

const playerStore = usePlayerStore();
const { knightTint, enemyTint, drawKnight, drawEnemy, loadImages } = useCombatDrawing();

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
  if (playerStore.playerTurn) {
    // Aumentar defensa temporalmente
    playerStore.defense += 5;
    console.log('Defensa aumentada');
    playerStore.playerTurn = false;
    setTimeout(() => {
      playerStore.enemyAttack();
    }, 1000);
    // Restaurar defensa después
    setTimeout(() => {
      playerStore.defense -= 5;
    }, 100);
  }
}

onMounted(() => {
  loadImages(knightCanvas, enemyCanvas);
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