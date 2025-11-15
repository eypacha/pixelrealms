// src/utilities/draw.js
import { createSeededRandom } from './randomWithSeed';
import { generateMidpointDisplacement2D } from './midpointDisplacement2D';

export function drawPlayer(ctx, position) {
  // Dibujar borde negro
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.strokeRect(position.x - 1, position.y - 1, 8, 8);
  // Dibujar cuadrado blanco
  ctx.fillStyle = 'white';
  ctx.fillRect(position.x, position.y, 6, 6);
}

export function drawAll(terrainCanvas, seedInput, playerStore, poiStore, { initializePlayer = false } = {}) {
  const canvas = terrainCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // Redibujar terreno
  const terrainSize = 257;
  const roughness = 0.7;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Generar terreno y matriz de alturas
  const seededRandom = createSeededRandom(seedInput.value);
  const heights2D = generateMidpointDisplacement2D(terrainSize, roughness, seededRandom);
  // Inicializar jugador solo si se genera nuevo terreno
  if (initializePlayer) {
    playerStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
    console.log('Posición inicial jugador:', playerStore.position);
    poiStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
  } else {
    // Actualizar referencias de terreno para movimiento
    playerStore.terrainRef = heights2D;
    playerStore.widthRef = canvas.width;
    playerStore.heightRef = canvas.height;
  }
  // Pintar terreno
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const tx = Math.floor(x * (terrainSize - 1) / (canvas.width - 1));
      const ty = Math.floor(y * (terrainSize - 1) / (canvas.height - 1));
      const h = heights2D[ty][tx];
      let color = '#228B22';
      if (h < -0.05) color = '#1e90ff';
      else if (h < 0.05) color = '#deb887';
      else if (h > 0.3) color = '#cccccc';
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Dibujar jugador
  drawPlayer(ctx, playerStore.position);
  // Dibujar puntos de interés
  poiStore.pois.forEach(poi => {
    ctx.fillStyle = 'gray';
    ctx.fillRect(poi.position.x - 5, poi.position.y - 5, 10, 10);
  });
}