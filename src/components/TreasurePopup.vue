<template>
  <div class="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center w-100 h-80 flex flex-col justify-center items-center">
      <h2 class="text-lg font-bold mb-2">You have found a treasure</h2>
      <div class="flex flex-col gap-2 items-center w-full mt-2">
        <button
            @click="claimCoins"
            :disabled="coinsClaimed"
            :class="['px-4 w-full mt-2 cursor-pointer text-black transition', coinsClaimed ? 'opacity-50' : '']"
          >
            Grab {{ coins }} <span style="font-size:1.1em;">🪙</span>
          </button>
        <button
            v-if="potions > 0"
            @click="claimPotions"
            :disabled="potionsClaimed"
            :class="['px-4 w-full mt-2 cursor-pointer text-black transition', potionsClaimed ? 'opacity-50' : '']"
          >
            Grab {{ potions }} <span style="font-size:1.1em;">🧪</span>
          </button>
      </div>
      <div class="flex flex-col gap-2 items-center w-full mt-4">
        <button @click="closePopup" class="px-4 py-1 w-full mt-2 cursor-pointer text-black transition">Continue the journey</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePoiStore } from '../stores/poi';
import { usePlayerStore } from '../stores/player';
const poiStore = usePoiStore();
const playerStore = usePlayerStore();

const coins = ref(0);
const potions = ref(0);
const coinsClaimed = ref(false);
const potionsClaimed = ref(false);

onMounted(() => {
  coins.value = Math.floor(Math.random() * 16) + 5; // 5-20
  potions.value = Math.floor(Math.random() * 4); // 0-3
});

function claimCoins() {
  if (!coinsClaimed.value) {
    playerStore.coins += coins.value;
    coinsClaimed.value = true;
  }
}

function claimPotions() {
  if (!potionsClaimed.value) {
    if (!playerStore.inventory.potion) playerStore.inventory.potion = 0;
    playerStore.inventory.potion += potions.value;
    potionsClaimed.value = true;
  }
}

function closePopup() {
  poiStore.treasureDiscovered = false;
}
</script>