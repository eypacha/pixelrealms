<template>
  <div class="absolute bg-[#00000080] outline-2 flex justify-center items-center w-full h-full    z-50">
    <div class="bg-white flex flex-col items-center justify-center w-full h-full p-8">
      <TopBar
        class="absolute bottom-5 left-5"
        :seed="seed"
        :isResetting="isResetting"
        @update:seed="onUpdateSeed"
        @random-seed="onRandomSeed"
      />
      <SettingsBar class="absolute bottom-5 right-5" />
        <h1 class="text-2xl font-bold mb-6">{{ $t('characterSelect.title') }}</h1>
        <h2 class="text-lg font-bold mb-6">{{ $t('characterSelect.choose') }}</h2>
      <div class="flex gap-8 justify-center items-center mb-8">
        <div
          v-for="char in characters"
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
            <div class="text-sm mb-2 flex max-w-[150px] justify-center flex-wrap gap-2">
              <span :title="$t('characterSelect.stats.health')">❤️{{ char.stats.health }}</span>
              <span :title="$t('characterSelect.stats.strength')">🗡️{{ char.stats.strength }}</span>
              <span :title="$t('characterSelect.stats.defense')">🛡️{{ char.stats.defense }}</span><br>
              <span :title="$t('characterSelect.stats.coins')">🪙{{ char.stats.coins }}</span>
              <span :title="$t('characterSelect.stats.potions')">🧪{{ char.stats.potion }}</span>
              <span :title="$t('characterSelect.stats.mana')">🪬{{ char.stats.mana }}</span>
            </div>
        </div>
      </div>
      <div :class="['flex flex-col', !selected ? 'invisible pointer-events-none' : '']">
        <button
            @click="startGame"
            class="mt-8 px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
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
import TopBar from './TopBar.vue';

const playerStore = usePlayerStore();
const selected = ref(null);

// Props y eventos para TopBar
const props = defineProps({
  seed: String,
  isResetting: Boolean
});
const emit = defineEmits(['update:seed', 'random-seed']);
function onUpdateSeed(newSeed) {
  emit('update:seed', newSeed);
}
function onRandomSeed() {
  emit('random-seed');
}

const characters = [
  {
    key: 'knight',
    name: 'Knight',
    img: 'images/yellowknight.png',
    stats: {
      health: 10,
      strength: 10,
      defense: 10,
      coins: 10,
      potion: 2,
      mana: 0
    }
  },
  {
    key: 'barbarian',
    name: 'Barbarian',
    img: 'images/barbarian.png',
    stats: {
      health: 10,
      strength: 12,
      defense: 8,
      coins: 10,
      potion: 2,
      mana: 0
    }
  },
  {
    key: 'elf',
    name: 'Elf',
    img: 'images/elf.png',
    stats: {
      health: 12,
      strength: 9,
      defense: 9,
      coins: 10,
      potion: 0,
      mana: 3,
    }
  }
];

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
  }
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
