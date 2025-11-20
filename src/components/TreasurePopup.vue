<template>
  <div class="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center w-100 h-100 flex flex-col justify-center items-center">
      <h2 class="text-lg font-bold mb-2">{{ $t('treasure.title') }}</h2>
      <div class="flex flex-col gap-2 items-center w-full mt-2">
        <button
            @click="claimCoins"
            :disabled="coinsClaimed"
            :class="['px-4 w-full mt-2 cursor-pointer text-black transition', coinsClaimed ? 'opacity-50' : '']"
          >
            {{ $t('treasure.grabCoins', { coins }) }} <span style="font-size:1.1em;">🪙</span>
          </button>
        <button
            v-if="potions > 0"
            @click="claimPotions"
            :disabled="potionsClaimed"
            :class="['px-4 w-full mt-2 cursor-pointer text-black transition', potionsClaimed ? 'opacity-50' : '']"
          >
            {{ $t('treasure.grabPotions', { potions }) }} <span style="font-size:1.1em;">🧪</span>
          </button>
        <button
            v-if="scrollFound"
            @click="claimScroll"
            :disabled="scrollClaimed"
            :class="['px-4 w-full mt-2 cursor-pointer text-black transition', scrollClaimed ? 'opacity-50' : '']"
          >
            {{ $t('treasure.grabScroll') }} (<span style="font-size:1.1em;">+2 🪬</span>)
          </button>
      </div>
      <div class="flex flex-col gap-2 items-center w-full mt-4">
        <button @click="closePopup" class="px-4 py-1 w-full mt-2 cursor-pointer text-black transition">{{ $t('treasure.continue') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePoiStore } from '../stores/poi';
import { usePlayerStore } from '../stores/player';
import { useSoundStore } from '../stores/sound';
const poiStore = usePoiStore();
const playerStore = usePlayerStore();
const soundStore = useSoundStore();


const coins = ref(0);
const potions = ref(0);
const coinsClaimed = ref(false);
const potionsClaimed = ref(false);

// Magic scroll
const scrollFound = ref(false);
const scrollClaimed = ref(false);

onMounted(() => {
  coins.value = Math.floor(Math.random() * 16) + 5; // 5-20
  potions.value = Math.floor(Math.random() * 4); // 0-3
  scrollFound.value = Math.random() < 0.5; // 50% probabilidad de scroll mágico
});

function claimCoins() {
  if (!coinsClaimed.value) {
    playerStore.coins += coins.value;
    coinsClaimed.value = true;
    // Sonido de monedas
    soundStore.playSound('coin');
  }
}

function claimPotions() {
  if (!potionsClaimed.value) {
    if (!playerStore.inventory.potion) playerStore.inventory.potion = 0;
    playerStore.inventory.potion += potions.value;
    potionsClaimed.value = true;
    soundStore.playSound('gulp');
  }
}

function claimScroll() {
  if (!scrollClaimed.value && scrollFound.value) {
    playerStore.mana += 2;
    scrollClaimed.value = true;
    soundStore.playSound('magic'); // Usa un sonido apropiado si existe
  }
}

function closePopup() {
  poiStore.treasureDiscovered = false;
}
</script>