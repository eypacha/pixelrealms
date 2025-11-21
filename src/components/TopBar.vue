<template>
  <div class="flex gap-2 items-center">
    <div>
        <label for="seed" class="mr-2 font-bold">Seed</label>
        <input id="seed" v-model="seedLocal" type="text" class="border px-2 py-1" @change="handleSeedInputChange" @blur="handleSeedInputChange" />
        <button
        @click="handleRandomSeed"
        class="ml-2 px-2 py-1 bg-blue-500 text-white"
        :disabled="isResetting"
        :class="isResetting ? 'opacity-50 pointer-events-none' : ''"
        >
        Random
    </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  seed: String,
  isResetting: Boolean
});
const emit = defineEmits(['update:seed', 'random-seed']);
const seedLocal = ref(props.seed);

watch(() => props.seed, (newSeed) => {
  seedLocal.value = newSeed;
});

function handleSeedInputChange() {
  emit('update:seed', seedLocal.value);
}
function handleRandomSeed() {
  emit('random-seed');
}
</script>
