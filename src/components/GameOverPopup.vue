<template>
  <div class="absolute inset-0 bg-[#00000050] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center">
      <h2 class="text-lg font-bold mb-4">Game Over</h2>
      <p>You have been defeated!</p>
      <div class="mt-4 flex justify-center">
        <button @click="restartGame" class="px-4 py-2 cursor-pointer">Restart Game</button>
      </div>
    </div>
  </div>
</template>

<script setup>
function restartGame() {
    window.location.reload();
}
</script>