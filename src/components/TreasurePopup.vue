<template>
  <div class="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center shadow-lg w-100 h-80 flex flex-col justify-center items-center">
      <h2 class="text-lg font-bold mb-2 text-yellow-700">You have found the treasure</h2>
      <div class="flex flex-col gap-2 items-center w-full mt-4">
        <button @click="closePopup" class="px-4 py-1 w-full mt-2 cursor-pointer text-black transition border border-yellow-400 rounded bg-yellow-100 hover:bg-yellow-200">Continue the journey</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePoiStore } from '../stores/poi';
const poiStore = usePoiStore();
function closePopup() {
  poiStore.treasureDiscovered.value = false;
}
</script>