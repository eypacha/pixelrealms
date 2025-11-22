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

function drawCell(ctx, heights2D, px, py, canvasWidth, canvasHeight, terrainSize) {
  const tx = Math.floor(px * (terrainSize - 1) / (canvasWidth - 1));
  const ty = Math.floor(py * (terrainSize - 1) / (canvasHeight - 1));
  const h = heights2D[ty]?.[tx];
  ctx.fillStyle = getColorForHeight(h);
  ctx.fillRect(px, py, 1, 1);
}

export function drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, worldOffset = { x: 0, y: 0 }, options = {}) {
  // Imagen de orc
  if (!drawAll.orcImage) {
    drawAll.orcImage = new Image();
    drawAll.orcImage.src = 'images/medium-orc.png';
    drawAll.orcImage.onload = () => {
      if (terrainCanvas && terrainCanvas.value) {
        drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, worldOffset, options);
      }
    };
  }
  const orcImg = drawAll.orcImage;

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
  
  const { initializePlayer = false, redrawTerrain = initializePlayer, onlyTerrain = false, onlyReactive = false } = options;
  // Regenerar alturas si inicializamos el jugador o si explicitamente pedimos redrawTerrain
  const regenerateHeights = initializePlayer || redrawTerrain;
  const canvas = terrainCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const terrainSize = 257;
  const roughness = 0.7;
  if (regenerateHeights && playerStore) {
    const seededRandom = createSeededRandom(seedInput.value);
    const heights2D = generateMidpointDisplacement2D(
      terrainSize,
      roughness,
      worldOffset.x || 0,
      worldOffset.y || 0,
      seedInput.value
    );
    playerStore.terrainRef = heights2D;
    playerStore.widthRef = canvas.width;
    playerStore.heightRef = canvas.height;
    if (initializePlayer) {
      playerStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
      console.log('Posición inicial jugador:', playerStore.position.x, playerStore.position.y);
    }
    if (poiStore && typeof poiStore.ensureForTile === 'function') {
      poiStore.ensureForTile(worldOffset.x || 0, worldOffset.y || 0, heights2D, canvas.width, canvas.height, seedInput.value);
    } else if (poiStore && typeof poiStore.initialize === 'function') {
      poiStore.initialize(heights2D, canvas.width, canvas.height, seededRandom);
    }
  }
  if (redrawTerrain || onlyTerrain) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Pintar terreno
    let heights2D;
    if (playerStore && playerStore.terrainRef) {
      heights2D = playerStore.terrainRef;
    } else {
      heights2D = generateMidpointDisplacement2D(
        terrainSize,
        roughness,
        worldOffset.x || 0,
        worldOffset.y || 0,
        seedInput.value
      );
      // Guardar el terreno en playerStore si existe
      if (playerStore) {
        playerStore.terrainRef = heights2D;
        playerStore.widthRef = canvas.width;
        playerStore.heightRef = canvas.height;
      }
    }
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        drawCell(ctx, heights2D, x, y, canvas.width, canvas.height, terrainSize);
      }
    }
    // Si solo queremos terreno, salimos aquí
    if (onlyTerrain) return;
  }
  // Erase old player if not redrawing terrain
  if (!redrawTerrain && playerStore && playerStore.oldPosition) {
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
  // Si solo queremos terreno, no dibujamos nada reactivo
  if (onlyTerrain) return;
  // Si solo queremos elementos reactivos, no dibujamos el terreno ni borramos jugador
  if (onlyReactive) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Dibujar puntos de interés y jugador solo si los stores existen
    if (poiStore && Array.isArray(poiStore.pois)) {
      if (!drawAll.darkKnightImage) {
        drawAll.darkKnightImage = new Image();
        drawAll.darkKnightImage.src = 'images/darkknight.png';
        drawAll.darkKnightImage.onload = () => {
          if (terrainCanvas && terrainCanvas.value) {
            drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, worldOffset, options);
          }
        };
      }
      const darkKnightImg = drawAll.darkKnightImage;
      poiStore.pois.forEach(poi => {
        if (poi.type === 'treasure') {
          const length = 5;
          ctx.save();
          ctx.strokeStyle = poi.discovered ? 'gray' : 'red';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(poi.position.x - length, poi.position.y - length);
          ctx.lineTo(poi.position.x + length, poi.position.y + length);
          ctx.moveTo(poi.position.x + length, poi.position.y - length);
          ctx.lineTo(poi.position.x - length, poi.position.y + length);
          ctx.stroke();
          ctx.restore();
        }
      });
      poiStore.pois.forEach(poi => {
        if (poi.type === 'darkknight') {
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
        } else if (poi.type !== 'treasure') {
          ctx.fillStyle = poi.discovered ? 'gray' : 'white';
          ctx.fillRect(poi.position.x - 5, poi.position.y - 5, 10, 10);
        }
      });
      // Dibujar enemigos derrotados de cualquier tipo
      if (Array.isArray(poiStore.defeatedEnemies)) {
        const offsetX = Number(worldOffset.x) || 0;
        const offsetY = Number(worldOffset.y) || 0;
        poiStore.defeatedEnemies
          .filter(pos => Number(pos.offsetX) === offsetX && Number(pos.offsetY) === offsetY)
          .forEach(pos => {
            ctx.save();
            ctx.globalAlpha = 0.4;
            let img = null;
            if (pos.type === 'orc' && orcImg.complete) img = orcImg;
            if (pos.type === 'goblin' && goblinImg.complete) img = goblinImg;
            // Puedes agregar más tipos aquí
            if (img) {
              ctx.drawImage(img, pos.x - 10, pos.y - 15, 20, 30);
            } else {
              // Si no hay imagen, dibuja un cuadrado gris
              ctx.fillStyle = 'gray';
              ctx.fillRect(pos.x - 5, pos.y - 5, 10, 10);
            }
            ctx.restore();
          });
      }
    }
    if (playerStore && playerStore.position) {
      const facingLeft = playerStore.lastDirection === 'left';
      drawPlayer(ctx, playerStore.position, playerImage, facingLeft);
      if (playerStore.currentOffset) {
        playerStore.currentOffset.x = worldOffset.x || 0;
        playerStore.currentOffset.y = worldOffset.y || 0;
      }
    }
    return;
  }
  // Si no es solo terreno ni solo reactivo, sigue el flujo original
  if (poiStore && Array.isArray(poiStore.pois)) {
    if (!drawAll.darkKnightImage) {
      drawAll.darkKnightImage = new Image();
      drawAll.darkKnightImage.src = 'images/darkknight.png';
      drawAll.darkKnightImage.onload = () => {
        if (terrainCanvas && terrainCanvas.value) {
          drawAll(terrainCanvas, seedInput, playerStore, poiStore, playerImage, worldOffset, options);
        }
      };
    }
    const darkKnightImg = drawAll.darkKnightImage;
    poiStore.pois.forEach(poi => {
      if (poi.type === 'treasure') {
        const length = 5;
        ctx.save();
        ctx.strokeStyle = poi.discovered ? 'gray' : 'red';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(poi.position.x - length, poi.position.y - length);
        ctx.lineTo(poi.position.x + length, poi.position.y + length);
        ctx.moveTo(poi.position.x + length, poi.position.y - length);
        ctx.lineTo(poi.position.x - length, poi.position.y + length);
        ctx.stroke();
        ctx.restore();
      }
    });
    poiStore.pois.forEach(poi => {
      if (poi.type === 'darkKnight') {
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
      } else if (poi.type !== 'treasure') {
        ctx.fillStyle = poi.discovered ? 'gray' : 'white';
        ctx.fillRect(poi.position.x - 5, poi.position.y - 5, 10, 10);
      }
    });
    if (orcImg.complete && Array.isArray(poiStore.defeatedOrcs)) {
      const offsetX = Number(worldOffset.x) || 0;
      const offsetY = Number(worldOffset.y) || 0;
      poiStore.defeatedOrcs
        .filter(pos => Number(pos.offsetX) === offsetX && Number(pos.offsetY) === offsetY)
        .forEach(pos => {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.drawImage(orcImg, pos.x - 10, pos.y - 15, 20, 30);
          ctx.restore();
        });
    }
  }
  if (playerStore && playerStore.position) {
    const facingLeft = playerStore.lastDirection === 'left';
    drawPlayer(ctx, playerStore.position, playerImage, facingLeft);
    if (playerStore.currentOffset) {
      playerStore.currentOffset.x = worldOffset.x || 0;
      playerStore.currentOffset.y = worldOffset.y || 0;
    }
  }
}