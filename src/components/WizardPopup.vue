<template>
  <div class="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center shadow-lg w-100 h-100">
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
        <template v-for="option in wizardOptions" :key="option.key">
          <button v-if="option.key === 'scroll'" @click="buyScroll" :disabled="playerStore.coins < 4" :class="['px-4 py-1 w-full cursor-pointer', playerStore.coins < 4 ? 'opacity-50' : '']">{{ $t('wizard.buyScroll') }}: 4🪙 </button>
          <button v-else-if="option.key === 'potion'" @click="usePotion" :disabled="playerStore.coins < POTION_COST" :class="['px-4 py-1 w-full cursor-pointer', playerStore.coins < POTION_COST ? 'opacity-50' : '']">{{ $t('wizard.buyPotion', { cost: POTION_COST }) }}🪙</button>
          <button v-else-if="option.key === 'sword'" @click="enchantSword" :disabled="playerStore.coins < ENCHANT_COST" :class="['text-smpx-4 py-1 w-full cursor-pointer', playerStore.coins < ENCHANT_COST ? 'opacity-50' : '']">{{ $t('wizard.enchantSword', { cost: ENCHANT_COST }) }}🪙</button>
          <button v-else-if="option.key === 'shield'" @click="enchantShield" :disabled="playerStore.coins < ENCHANT_COST" :class="['px-4 py-1 w-full cursor-pointer', playerStore.coins < ENCHANT_COST ? 'opacity-50' : '']">{{ $t('wizard.enchantShield', { cost: ENCHANT_COST }) }}🪙</button>
        </template>
        <button @click="closePopup" class="px-4 py-1 w-full mt-2 cursor-pointer">{{ $t('wizard.leave') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const allWizardOptions = [
  { key: 'scroll', label: 'Buy Magic Scroll' },
  { key: 'potion', label: 'Buy Potion' },
  { key: 'sword', label: 'Enchant Sword' },
  { key: 'shield', label: 'Enchant Shield' }
];
const wizardOptions = ref([]);
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useSoundStore } from '../stores/sound';
import { POTION_COST, ENCHANT_COST, ENCHANT_CHANCE } from '../constants/poi';

const playerStore = usePlayerStore();
const soundStore = useSoundStore();
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
  soundStore.playSound('coin');
  message.value = `You bought a potion!`;
}

function enchantSword() {
  if (playerStore.coins < ENCHANT_COST) {
    message.value = `Please ${ENCHANT_COST} coins to enchant your sword.`;
    return;
  }
  playerStore.coins -= ENCHANT_COST;
  soundStore.playSound('coin');
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
  soundStore.playSound('coin');
  if (Math.random() < ENCHANT_CHANCE) {
    playerStore.defense++;
    message.value = `Shield enchanted! +1 DEF`;
  } else {
    message.value = `The spell failed.`;
  }
}

function buyScroll() {
  if (playerStore.coins < 4) {
    message.value = 'You need 4 coins to buy a Magic Scroll.';
    return;
  }
  playerStore.coins -= 4;
  playerStore.mana += 2;
  soundStore.playSound('coin');
  message.value = 'You bought a Magic Scroll!';
}

function closePopup() {
  playerStore.wizardActive = false;
  message.value = '';
}

onMounted(() => {
    // Seleccionar 3 opciones al azar cada vez que aparece el mago
    const shuffled = allWizardOptions.slice().sort(() => Math.random() - 0.5);
    wizardOptions.value = shuffled.slice(0, 3);
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
