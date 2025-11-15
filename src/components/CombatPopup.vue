<template>
  <div class="absolute inset-0 bg-[#00000050] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center">
      <h2>VS</h2>
      <div class="flex justify-center space-x-4 mb-4">
        <div class="flex gap-2">
          <div>
            <div>❤️ {{ playerStore.health }}</div>
            <div>💪 {{ playerStore.strength }}</div>
            <div>🛡️ {{ playerStore.defense }}</div>
          </div>
          <canvas ref="knightCanvas" width="60" height="80"></canvas>
        </div>
        <div class="flex enemy">
          <canvas ref="enemyCanvas" width="60" height="80"></canvas>
          <div>enemy stats</div>
        </div>
      </div>
      <p>Aquí irá la lógica del combate.</p>
      <div class="mt-4 flex space-x-2">
        <button @click="swordAttack" class="px-4 py-2 cursor-pointer">Atacar</button>
        <button @click="cover" class="px-4 py-2 cursor-pointer">Defender</button>
        <button @click="flee" class="px-4 py-2 cursor-pointer">Huir</button>
      </div>
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

function swordAttack() {
  // Lógica de ataque con espada
  console.log('Ataque con espada');
}

function cover() {
  // Lógica de cubrirse
  console.log('Cubrirse');
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