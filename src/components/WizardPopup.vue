<template>
  <div class="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center shadow-lg min-w-[350px]">
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
        <button @click="usePotion" :disabled="playerStore.inventory.potion <= 0" class="px-4 py-1 w-full">Buy Potion: {{ POTION_COST }}🪙</button>
        <button @click="enchantSword" class="px-4 py-1 w-full">Enchant Sword: {{ ENCHANT_COST }}🪙</button>
        <button @click="enchantShield" class="px-4 py-1 w-full">Enchant Shield: {{ ENCHANT_COST }}🪙</button>
        <button @click="closePopup" class="px-4 py-1 w-full mt-2">Leave</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useCombatDrawing } from '../composables/useCombatDrawing';
import { POTION_COST, ENCHANT_COST, ENCHANT_CHANCE } from '../constants/wizard';

const playerStore = usePlayerStore();
const soundStore = playerStore.$state.soundStore || (typeof playerStore.playSound === 'function' ? playerStore : null);
const { drawKnight } = useCombatDrawing();
const playerCanvas = ref(null);
const wizardCanvas = ref(null);
const message = ref('Hi, traveler! How can I help you?');

function usePotion() {
  if (playerStore.coins < POTION_COST) {
    message.value = `Please ${POTION_COST} coins to buy a potion.`;
    return;
  }
  playerStore.coins -= POTION_COST;
  if (!playerStore.inventory.potion) playerStore.inventory.potion = 0;
  playerStore.inventory.potion++;
  if (typeof playerStore.playSound === 'function') {
    playerStore.playSound('coin');
  }
  message.value = `You bought a potion!`;
}

function enchantSword() {
  if (playerStore.coins < ENCHANT_COST) {
    message.value = `Please ${ENCHANT_COST} coins to enchant your sword.`;
    return;
  }
  playerStore.coins -= ENCHANT_COST;
  if (typeof playerStore.playSound === 'function') {
    playerStore.playSound('coin');
  }
  if (Math.random() < ENCHANT_CHANCE) {
    playerStore.strength++;
    message.value = `Sword enchanted! +1 STR`;
  } else {
    message.value = `The spell failed.`;
  }
}

function enchantShield() {
  if (playerStore.coins < ENCHANT_COST) {
    message.value = `Please ${ENCHANT_COST} coins to enchant your shield.`;
    return;
  }
  playerStore.coins -= ENCHANT_COST;
  if (typeof playerStore.playSound === 'function') {
    playerStore.playSound('coin');
  }
  if (Math.random() < ENCHANT_CHANCE) {
    playerStore.defense++;
    message.value = `Shield enchanted! +1 DEF`;
  } else {
    message.value = `The spell failed.`;
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
    img.src = 'images/knight.png';
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
    img.src = 'images/wizard.png';
  }
});
</script>
