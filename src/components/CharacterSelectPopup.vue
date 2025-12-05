<template>
  <div class="absolute bg-[#00000080] outline-2 flex justify-center items-center w-full h-full    z-50">
    <div class="bg-white flex flex-col items-center justify-center w-full h-full p-8">
      <SettingsBar class="absolute bottom-5 right-5" />
        <h1 class="text-3xl font-bold mb-20">{{ $t('characterSelect.title') }}</h1>
        <h2 class="text-lg font-bold mb-6">{{ $t('characterSelect.choose') }}</h2>
      <div class="flex gap-8 justify-center items-center mb-8">
        <div
          v-for="char in CHARACTERS"
          @click="selectCharacter(char)"
          :key="char.key"
          :class="[
            'flex flex-col items-center cursor-pointer transition-all',
            selected?.key === char.key ? 'scale-105 border-2 border-gray-400' : 'border-2 border-transparent'
          ]"
          style="padding: 8px;"
        >
          <img :src="char.img" :alt="char.name" class="w-[60px] h-[80px] mb-2" />
            <div class="font-bold mb-1">{{ $t('characterSelect.characters.' + char.key) }}</div>
            <div class="text-sm mb-2 flex max-w-[120px] justify-center flex-wrap gap-2">
              <span :title="$t('characterSelect.stats.health')">❤️{{ char.stats.health }}</span>
              <span :title="$t('characterSelect.stats.strength')">🗡️{{ char.stats.strength }}</span>
              <span :title="$t('characterSelect.stats.defense')">🛡️{{ char.stats.defense }}</span><br>
              <span :title="$t('characterSelect.stats.coins')">🪙{{ char.stats.coins }}</span>
              <span :title="$t('characterSelect.stats.potions')">🧪{{ char.stats.potion }}</span>
              <span :title="$t('characterSelect.stats.mana')">🪬{{ char.stats.mana }}</span>
            </div>
        </div>
      </div>
      <div class="flex gap-3 mt-8">
        <button
            v-if="hasSavedGame"
            @click="continueGame"
            class="px-6 py-2 bg-green-600 text-white font-bold hover:bg-green-700 transition"
          >{{ $t('characterSelect.continue') }}</button>
        <button
            @click="startGame"
            class="px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            :class="{ 'opacity-50 cursor-not-allowed': !selected }"
            :disabled="!selected"
          >{{ $t('characterSelect.start') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePlayerStore } from '../stores/player';
import SettingsBar from './SettingsBar.vue';
import { CHARACTERS } from '../constants/player';
import { hasGameState } from '../composables/useLocalStorage';

const playerStore = usePlayerStore();
// Selecciona el personaje del medio al iniciar
const middleIndex = Math.floor(CHARACTERS.length / 2);
const selected = ref(CHARACTERS[middleIndex] || null);

// Verificar si hay juego guardado
const hasSavedGame = ref(hasGameState());

const emit = defineEmits(['continue-game', 'start-game']);

function selectCharacter(char) {
  selected.value = char;
}

function startGame() {
  if (selected.value) {
    playerStore.character = selected.value.key;
    playerStore.health = selected.value.stats.health;
    playerStore.maxHealth = selected.value.stats.health;
    playerStore.strength = selected.value.stats.strength;
    playerStore.defense = selected.value.stats.defense;
    playerStore.coins = selected.value.stats.coins;
    playerStore.inventory.potion = selected.value.stats.potion;
    playerStore.mana = selected.value.stats.mana;
    playerStore.image = selected.value.img;
    playerStore.characterSelected = true;
    // Emitir evento para que HomeView inicialice el juego
    emit('start-game');
  }
}

function continueGame() {
  emit('continue-game');
}
</script>

<style scoped>
.fixed {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}
</style>
