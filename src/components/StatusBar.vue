<template>
  <div>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': healthAnimating }">❤️{{ health }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': strengthAnimating }">{{ playerStore.weaponIcon }}{{ strength }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': defenseAnimating }">🛡️{{ defense }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': coinsAnimating }">🪙{{ coins }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': potionAnimating }">🧪{{ potion }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': manaAnimating }">🪬{{ mana }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': defeatedEnemiesAnimating }">💀{{ defeatedEnemies }}</span>
    <span class="inline-block transition-all duration-300 mr-3" :class="{ 'scale-120': stepsAnimating }">👣{{ steps }}</span>
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
const defeatedEnemiesAnimating = ref(false);
const stepsAnimating = ref(false);

const health = computed(() => Math.floor(playerStore.health));
const strength = computed(() => Math.floor(playerStore.strength));
const defense = computed(() => Math.floor(playerStore.defense));
const coins = computed(() => Math.floor(playerStore.coins));
const potion = computed(() => Math.floor(playerStore.inventory.potion));
const mana = computed(() => Math.floor(playerStore.mana));
const defeatedEnemies = computed(() => playerStore.defeatedEnemiesCount ?? 0);
const steps = computed(() => playerStore.steps ?? 0);

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

watch(defeatedEnemies, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    defeatedEnemiesAnimating.value = true;
    setTimeout(() => {
      defeatedEnemiesAnimating.value = false;
    }, 300);
  }
});

watch(steps, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    stepsAnimating.value = true;
    setTimeout(() => {
      stepsAnimating.value = false;
    }, 300);
  }
});

</script>
