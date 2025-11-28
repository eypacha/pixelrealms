<template>
  <div class="flex flex-col items-center gap-2">
    <canvas ref="mergeCanvas" width="800" height="600" class="w-[500px]"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { usePlayerStore } from '../stores/player';
const playerStore = usePlayerStore();
const terrainImage = ref(playerStore.terrainImage);
const reactiveImage = ref(playerStore.reactiveImage);
const mergedImage = ref(null);
const mergeCanvas = ref(null);

function mergeImages() {
  if (!terrainImage.value || !reactiveImage.value || !mergeCanvas.value) return;
  const canvas = mergeCanvas.value;
  const ctx = canvas.getContext('2d');
  const baseImg = new window.Image();
  const overlayImg = new window.Image();
  let baseLoaded = false;
  let overlayLoaded = false;

  function tryDraw() {
    if (baseLoaded && overlayLoaded) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
      mergedImage.value = canvas.toDataURL('image/png');
    }
  }

  baseImg.onload = () => {
    baseLoaded = true;
    tryDraw();
  };
  overlayImg.onload = () => {
    overlayLoaded = true;
    tryDraw();
  };
  baseImg.src = terrainImage.value;
  overlayImg.src = reactiveImage.value;
  // Si ya están cargadas (por caché)
  if (baseImg.complete) {
    baseLoaded = true;
  }
  if (overlayImg.complete) {
    overlayLoaded = true;
  }
  tryDraw();
}

watch(() => playerStore.terrainImage, (val) => {
  terrainImage.value = val;
  nextTick(mergeImages);
});
watch(() => playerStore.reactiveImage, (val) => {
  reactiveImage.value = val;
  nextTick(mergeImages);
});

onMounted(() => {
  nextTick(mergeImages);
});
</script>
