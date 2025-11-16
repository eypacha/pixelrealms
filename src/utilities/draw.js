// src/utilities/draw.js
import { createSeededRandom } from './randomWithSeed';
import { generateMidpointDisplacement2D } from './midpointDisplacement2D';

export function drawPlayer(ctx, position, image) {
  if (image && image.complete) {
    ctx.drawImage(image, position.x - 7.5, position.y - 10, 15, 20);
  }
}

export function getColorForHeight(h) {
  if (h === undefined || h === null) return '#cccccc';
  if (h < -0.05) return '#1e90ff';
  if (h < 0.05) return '#deb887';
  return '#228B22';
}

function drawCell(ctx, playerStore, px, py, canvasWidth, canvasHeight, terrainSize) {
  if (!playerStore || !playerStore.terrainRef) return;
  const tx = Math.floor(px * (terrainSize - 1) / (canvasWidth - 1));
  const ty = Math.floor(py * (terrainSize - 1) / (canvasHeight - 1));
  const h = playerStore.terrainRef[ty]?.[tx];
  ctx.fillStyle = getColorForHeight(h);
  ctx.fillRect(px, py, 1, 1);
}

export function drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, worldOffset = { x: 0, y: 0 }, options = {}) {
  const { initializePlayer = false, redrawTerrain = initializePlayer } = options;
  // Regenerar alturas si inicializamos el jugador o si explicitamente pedimos redrawTerrain
  const regenerateHeights = initializePlayer || redrawTerrain;
  const canvas = terrainCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const terrainSize = 257;
  const roughness = 0.7;
  if (regenerateHeights) {
    const seededRandom = createSeededRandom(seedInput.value);
    // Pasar `seedInput.value` y `worldOffset` al generador para generación determinista por coordenada
    const heights2D = generateMidpointDisplacement2D(
      terrainSize,
      roughness,
      null,
      worldOffset.x || 0,
      worldOffset.y || 0,
      seedInput.value
    );
    playerStore.terrainRef = heights2D;
    playerStore.widthRef = canvas.width;
    playerStore.heightRef = canvas.height;
    // mantener seededRandom para inicializar posiciones
    if (initializePlayer) {
      playerStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
      console.log('Posición inicial jugador:', playerStore.position);
    }
    // generar o asegurar POIs para el tile actual (usa seed + offset internamente)
    if (typeof poiStore.ensureForTile === 'function') {
      poiStore.ensureForTile(worldOffset.x || 0, worldOffset.y || 0, heights2D, canvas.width, canvas.height, seedInput.value);
    } else if (typeof poiStore.initialize === 'function') {
      // fallback al comportamiento antiguo
      poiStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
    }
  }
  if (redrawTerrain) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Pintar terreno
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        drawCell(ctx, playerStore, x, y, canvas.width, canvas.height, terrainSize);
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
          drawCell(ctx, playerStore, px, py, canvas.width, canvas.height, terrainSize);
        }
      }
    }
  }
  // Dibujar jugador
  drawPlayer(ctx, playerStore.position, playerImage);
  // Dibujar puntos de interés
  poiStore.pois.forEach(poi => {
    ctx.fillStyle = poi.discovered ? 'gray' : 'white';
    ctx.fillRect(poi.position.x - 5, poi.position.y - 5, 10, 10);
  });
}