// src/utilities/draw.js
import { createSeededRandom } from './randomWithSeed';
import { generateMidpointDisplacement2D } from './midpointDisplacement2D';

export function drawPlayer(ctx, position, image, facingLeft = false) {
  if (!image || !image.complete) return;
  const w = 20;
  const h = 30;
  const drawX = position.x - w / 2;
  const drawY = position.y - h / 2;
  if (facingLeft) {
    ctx.save();
    
    ctx.translate(drawX + w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(drawX + w / 2), 0);
    ctx.drawImage(image, drawX, drawY, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(image, drawX, drawY, w, h);
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
  // Imagen de goblin
  if (!drawAll.goblinImage) {
    drawAll.goblinImage = new Image();
    drawAll.goblinImage.src = 'images/goblin.png';
    drawAll.goblinImage.onload = () => {
      if (terrainCanvas && terrainCanvas.value) {
        drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, worldOffset, options);
      }
    };
  }
  const goblinImg = drawAll.goblinImage;

  // Imagen de wizard
  if (!drawAll.wizardImage) {
    drawAll.wizardImage = new Image();
    drawAll.wizardImage.src = 'images/wizard.png';
    drawAll.wizardImage.onload = () => {
      if (terrainCanvas && terrainCanvas.value) {
        drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, worldOffset, options);
      }
    };
  }
  const wizardImg = drawAll.wizardImage;
  
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
  // Dibujar puntos de interés
  // Usar la imagen del Dark Knight para los castillos
  if (!drawAll.darkKnightImage) {
    drawAll.darkKnightImage = new Image();
    drawAll.darkKnightImage.src = 'images/darkknight.png';
    drawAll.darkKnightImage.onload = () => {
      // Redibujar el canvas cuando la imagen esté lista
      if (terrainCanvas && terrainCanvas.value) {
        // Llamar a drawAll con los mismos argumentos
        drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, worldOffset, options);
      }
    };
  }
  const darkKnightImg = drawAll.darkKnightImage;
  poiStore.pois.forEach(poi => {
    if (poi.type === 'castle') {
      if (darkKnightImg.complete) {
        ctx.save();
        if (poi.discovered) {
          ctx.globalAlpha = 0.4;
        }
        ctx.drawImage(darkKnightImg, poi.position.x - 10, poi.position.y - 15, 20, 30);
        ctx.restore();
      }
    } else if (poi.type === 'wizard') {
      if (wizardImg.complete) {
        ctx.save();
        if (poi.discovered) {
          ctx.globalAlpha = 0.4;
        }
        ctx.drawImage(wizardImg, poi.position.x - 10, poi.position.y - 15, 20, 30);
        ctx.restore();
      }
      // No dibujar nada si la imagen no está lista
    } else {
      ctx.fillStyle = poi.discovered ? 'gray' : 'white';
      ctx.fillRect(poi.position.x - 5, poi.position.y - 5, 10, 10);
    }
  });
  // Dibujar goblins derrotados SOLO del tile actual
  if (goblinImg.complete && Array.isArray(poiStore.defeatedGoblins)) {
    const offsetX = Number(worldOffset.x) || 0;
    const offsetY = Number(worldOffset.y) || 0;
    poiStore.defeatedGoblins
      .filter(pos => Number(pos.offsetX) === offsetX && Number(pos.offsetY) === offsetY)
      .forEach(pos => {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.drawImage(goblinImg, pos.x - 10, pos.y - 15, 20, 30);
        ctx.restore();
      });
  }
  // Dibujar jugador (respetando la última dirección izquierda/derecha) al final para que quede encima
  const facingLeft = playerStore.lastDirection === 'left';
  drawPlayer(ctx, playerStore.position, playerImage, facingLeft);

  // Actualizar el offset actual en el store de jugador
  if (playerStore.currentOffset) {
    playerStore.currentOffset.x = worldOffset.x || 0;
    playerStore.currentOffset.y = worldOffset.y || 0;
  }
}