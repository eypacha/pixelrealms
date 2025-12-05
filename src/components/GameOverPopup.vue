<template>
  <div class="absolute inset-0 bg-[#00000050] flex justify-center items-center z-50 ">
    <div class="bg-white p-5 text-center w-full h-full flex flex-col items-center justify-center">
      <h2 class="text-lg font-bold">{{ $t('gameOver.title') }}</h2>
      <p>{{ $t('gameOver.defeated') }}</p>
      <p v-if="playerStore.runCount > 0" class="text-sm text-gray-600">
        {{ $t('gameOver.runCount', { count: playerStore.runCount }) }}
      </p>
      <div class="my-6">
        <MiniJourneyMap />
      </div>
      <div class="mt-4 flex gap-3 items-center">
        <button @click="retryRun" class="px-6 py-2 bg-green-600 text-white font-bold hover:bg-green-700 transition">
          {{ $t('gameOver.retry') }}
        </button>
        <button @click="newGame" class="px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
          {{ $t('gameOver.newGame') }}
        </button>
      </div>
      <p v-if="playerStore.runCount > 0" class="text-xs text-gray-500 mt-1">
        {{ $t('gameOver.retryBonus') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import MiniJourneyMap from './MiniJourneyMap.vue';
import { usePlayerStore } from '../stores/player.js';

const playerStore = usePlayerStore();

function retryRun() {
  playerStore.retryRun();
}

function newGame() {
  window.location.reload();
}
</script>