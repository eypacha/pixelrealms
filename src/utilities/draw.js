// src/utilities/draw.js
import { createSeededRandom } from './randomWithSeed';
import { generateMidpointDisplacement2D } from './midpointDisplacement2D';

export function drawPlayer(ctx, position, image) {
  if (image && image.complete) {
    ctx.drawImage(image, position.x - 7.5, position.y - 10, 15, 20);
  }
}

export function drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, options = {}) {
  const { initializePlayer = false, redrawTerrain = initializePlayer } = options;
  const canvas = terrainCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const terrainSize = 257;
  const roughness = 0.7;
  const regenerateHeights = initializePlayer;
  if (regenerateHeights) {
    const seededRandom = createSeededRandom(seedInput.value);
    const heights2D = generateMidpointDisplacement2D(terrainSize, roughness, seededRandom);
    playerStore.terrainRef = heights2D;
    playerStore.widthRef = canvas.width;
    playerStore.heightRef = canvas.height;
    if (initializePlayer) {
      playerStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
      console.log('Posición inicial jugador:', playerStore.position);
      poiStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
    }
  }
  if (redrawTerrain) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Pintar terreno
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const tx = Math.floor(x * (terrainSize - 1) / (canvas.width - 1));
        const ty = Math.floor(y * (terrainSize - 1) / (canvas.height - 1));
        const h = playerStore.terrainRef[ty][tx];
        let color = '#228B22';
        if (h < -0.05) color = '#1e90ff';
        else if (h < 0.05) color = '#deb887';
        else if (h > 0.3) color = '#cccccc';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  // Erase old player if not redrawing terrain
  if (!redrawTerrain) {
    const { x, y } = playerStore.oldPosition;
    for (let dy = -12; dy < 13; dy++) {
      for (let dx = -10; dx < 10; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const tx = Math.floor(px * (terrainSize - 1) / (canvas.width - 1));
          const ty = Math.floor(py * (terrainSize - 1) / (canvas.height - 1));
          const h = playerStore.terrainRef[ty][tx];
          let color = '#228B22';
          if (h < -0.05) color = '#1e90ff';
          else if (h < 0.05) color = '#deb887';
          else if (h > 0.3) color = '#cccccc';
          ctx.fillStyle = color;
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }
  // Dibujar jugador
  drawPlayer(ctx, playerStore.position, playerImage);
  // Dibujar puntos de interés
  poiStore.pois.forEach(poi => {
    ctx.fillStyle = 'gray';
    ctx.fillRect(poi.position.x - 5, poi.position.y - 5, 10, 10);
  });
}