<template>
  <div class="absolute inset-0 bg-[#00000050] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center">
      <h2>Combate</h2>
      <p>Aquí irá la lógica del combate.</p>
      <button @click="flee" class="mt-4 px-4 py-2">Huir</button>
      <!-- Por ahora, solo un placeholder -->
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from './stores/player';

const playerStore = usePlayerStore();

function flee() {
  playerStore.combatActive = false;
}
</script>