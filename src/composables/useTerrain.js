// src/composables/useTerrain.js
import { ref } from 'vue';
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';
import { createSeededRandom } from '../utilities/randomWithSeed';

export function useTerrain(terrainSize = 257, roughness = 0.7, initialSeed = '12345') {
  const terrainCanvas = ref(null);
  const seedInput = ref(initialSeed);

  function randomizeSeed() {
    seedInput.value = Math.floor(Math.random() * 100000000).toString();
    updateTerrain();
  }

  function drawTerrain(ctx, width, height, seed) {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, width, height);
    const seededRandom = createSeededRandom(seed);
    const heights2D = generateMidpointDisplacement2D(terrainSize, roughness, seededRandom);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tx = Math.floor(x * (terrainSize - 1) / (width - 1));
        const ty = Math.floor(y * (terrainSize - 1) / (height - 1));
        const h = heights2D[ty][tx];
        let color = '#228B22';
        if (h < -0.05) color = '#1e90ff';
        else if (h < 0.05) color = '#deb887';
        else if (h > 0.3) color = '#cccccc';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function updateTerrain() {
    const canvas = terrainCanvas.value;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      drawTerrain(ctx, canvas.width, canvas.height, seedInput.value);
    }
  }

  return {
    terrainCanvas,
    seedInput,
    randomizeSeed,
    updateTerrain,
  };
}
