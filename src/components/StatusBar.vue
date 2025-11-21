<template>
  <div>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': healthAnimating }">❤️{{ health }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': strengthAnimating }">🗡️{{ strength }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': defenseAnimating }">🛡️{{ defense }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': coinsAnimating }">🪙{{ coins }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': potionAnimating }">🧪{{ potion }}</span>
    <span class="inline-block transition-all duration-300" :class="{ 'scale-120': manaAnimating }">🪬{{ mana }}</span>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '../stores/player';

const playerStore = usePlayerStore();

const healthAnimating = ref(false);
const strengthAnimating = ref(false);
const defenseAnimating = ref(false);
const coinsAnimating = ref(false);
const potionAnimating = ref(false);
const manaAnimating = ref(false);

const health = computed(() => playerStore.health);
const strength = computed(() => playerStore.strength);
const defense = computed(() => playerStore.defense);
const coins = computed(() => playerStore.coins);
const potion = computed(() => playerStore.inventory.potion);
const mana = computed(() => playerStore.mana);

watch(health, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    healthAnimating.value = true;
    setTimeout(() => {
      healthAnimating.value = false;
    }, 300);
  }
});
watch(strength, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    strengthAnimating.value = true;
    setTimeout(() => {
      strengthAnimating.value = false;
    }, 300);
  }
});
watch(defense, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    defenseAnimating.value = true;
    setTimeout(() => {
      defenseAnimating.value = false;
    }, 300);
  }
});
watch(coins, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    coinsAnimating.value = true;
    setTimeout(() => {
      coinsAnimating.value = false;
    }, 300);
  }
});
watch(potion, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    potionAnimating.value = true;
    setTimeout(() => {
      potionAnimating.value = false;
    }, 300);
  }
});
watch(mana, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    manaAnimating.value = true;
    setTimeout(() => {
      manaAnimating.value = false;
    }, 300);
  }
});
</script>
