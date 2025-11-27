// src/composables/useTerrain.js
import { ref } from 'vue';
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';
import { createSeededRandom } from '../utilities/randomWithSeed';

export function useTerrain(terrainSize = 257, roughness = 0.7, initialSeed = Math.floor(Math.random() * 100000000).toString()) {
  const terrainCanvas = ref(null);
  const seedInput = ref(initialSeed);
  // worldOffset in units of the generator grid (indices). Move by (terrainSize - 1) to shift one tile.
  const worldOffset = ref({ x: 0, y: 0 });

  function setOffset(x, y) {
    worldOffset.value.x = x;
    worldOffset.value.y = y;
    updateTerrain();
  }

  function addOffset(dx, dy) {
    worldOffset.value.x += dx;
    worldOffset.value.y += dy;
    updateTerrain();
  }

  function randomizeSeed() {
    seedInput.value = Math.floor(Math.random() * 100000000).toString();
    updateTerrain();
  }

  function drawTerrain(ctx, width, height, seed, offset = { x: 0, y: 0 }) {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, width, height);
    const seededRandom = createSeededRandom(seed);
    // Pasar `seed` y `offset` al generador para generar la porción adecuada del mundo
    const heights2D = generateMidpointDisplacement2D(terrainSize, roughness, offset.x || 0, offset.y || 0, seed);
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
      drawTerrain(ctx, canvas.width, canvas.height, seedInput.value, worldOffset.value);
    }
  }

  // Verifica si una posición (x, y) es terreno válido (no agua)
  function isValidTerrain(x, y, width, height, heights2D) {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    const tx = Math.floor(x * (terrainSize - 1) / (width - 1));
    const ty = Math.floor(y * (terrainSize - 1) / (height - 1));
    return heights2D[ty]?.[tx] > -0.05;
  }

  return {
    terrainCanvas,
    seedInput,
    worldOffset,
    setOffset,
    addOffset,
    tileStep: terrainSize - 1,
    randomizeSeed,
    updateTerrain,
    isValidTerrain,
  };
}
