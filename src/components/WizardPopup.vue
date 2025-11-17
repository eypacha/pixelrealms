<template>
  <div class="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center rounded shadow-lg min-w-[350px]">
      <div class="flex justify-center gap-8 mb-4">
        <div>
          <canvas ref="playerCanvas" width="60" height="80"></canvas>
        </div>
        <div>
          <canvas ref="wizardCanvas" width="60" height="80"></canvas>
        </div>
      </div>
      <div class="mt-2 text-center text-sm text-gray-700 mb-5">{{ message }}</div>

      <div class="flex flex-col gap-2 items-center">
        <button @click="usePotion" :disabled="playerStore.inventory.potion <= 0" class="px-4 py-1 w-full">Buy Potion: 6🪙</button>
        <button @click="enchantSword" class="px-4 py-1 w-full">Enchant Sword: 10🪙</button>
        <button @click="enchantShield" class="px-4 py-1 w-full">Enchant Shield: 10🪙</button>
        <button @click="closePopup" class="px-4 py-1 w-full mt-2">Leave</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useCombatDrawing } from '../composables/useCombatDrawing';

const playerStore = usePlayerStore();
const { drawKnight } = useCombatDrawing();
const playerCanvas = ref(null);
const wizardCanvas = ref(null);
const message = ref('Hi, traveler! How can I help you?');

function usePotion() {
  const cost = 6;
  if (playerStore.coins < cost) {
    message.value = `You need ${cost} coins to buy a potion.`;
    return;
  }
  playerStore.coins -= cost;
  if (!playerStore.inventory.potion) playerStore.inventory.potion = 0;
  playerStore.inventory.potion++;
  message.value = `You bought a potion! (+1 potion, -${cost} coins)`;
}

function enchantSword() {
  const cost = 10;
  if (playerStore.coins < cost) {
    message.value = `You need ${cost} coins to enchant your sword.`;
    return;
  }
  playerStore.coins -= cost;
  if (Math.random() < 0.5) {
    playerStore.strength++;
    message.value = `Sword enchanted! +1 STR (-${cost} coins)`;
  } else {
    message.value = 'The spell failed. (-' + cost + ' coins)';
  }
}

function enchantShield() {
  const cost = 10;
  if (playerStore.coins < cost) {
    message.value = `You need ${cost} coins to enchant your shield.`;
    return;
  }
  playerStore.coins -= cost;
  if (Math.random() < 0.5) {
    playerStore.defense++;
    message.value = `Shield enchanted! +1 DEF (-${cost} coins)`;
  } else {
    message.value = 'The spell failed. (-' + cost + ' coins)';
  }
}

function closePopup() {
  playerStore.wizardActive = false;
  message.value = '';
}

onMounted(() => {
  // Draw player
  if (playerCanvas.value) {
    const ctx = playerCanvas.value.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 60, 80);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 60, 80);
    };
    img.src = '/images/knight.png';
  }
  // Draw wizard
  if (wizardCanvas.value) {
    const ctx = wizardCanvas.value.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 60, 80);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 60, 80);
    };
    img.src = '/images/wizard.png';
  }
});
</script>
