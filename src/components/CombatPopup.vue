<template>
  <div class="absolute inset-0 bg-[#00000050] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center">
      <h2>Combate</h2>
      <div class="flex justify-center space-x-4 mb-4">
        <canvas ref="knightCanvas" width="60" height="80"></canvas>
        <canvas ref="enemyCanvas" width="60" height="80"></canvas>
      </div>
      <p>Aquí irá la lógica del combate.</p>
      <button @click="flee" class="mt-4 px-4 py-2">Huir</button>
      <!-- Por ahora, solo un placeholder -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '../stores/player';

const playerStore = usePlayerStore();

const knightCanvas = ref(null);
const enemyCanvas = ref(null);

function flee() {
  playerStore.combatActive = false;
}

onMounted(() => {
  // Draw knight.png on knightCanvas
  const knightImg = new Image();
  knightImg.onload = () => {
    const ctx = knightCanvas.value.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(knightImg, 0, 0, 60, 80);
  };
  knightImg.src = '/images/knight.png';

  // Draw goblin.png on goblinCanvas
  const goblinImg = new Image();
  goblinImg.onload = () => {
    const ctx = enemyCanvas.value.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(goblinImg, 0, 0, 60, 80);
  };
  goblinImg.src = '/images/goblin.png';
});
</script>