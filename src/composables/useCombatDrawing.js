
import { ref } from 'vue';
import { ENEMIES } from '../constants/enemies.js';

export function useCombatDrawing() {
  const knightImg = ref(null);
  const enemyImg = ref(null);
  // Mapa para imágenes de enemigos
  const enemyImgs = {};
  // Construir el objeto de tipos y rutas dinámicamente
  const enemyTypes = Object.fromEntries(
    Object.entries(ENEMIES).map(([key, val]) => [key, val.image])
  );
  const knightTint = ref(false);
  const knightFreezeTint = ref(false);
  const enemyTint = ref(false);
  const enemyFreezeTint = ref(false);

  function drawCharacter(canvas, img, tintType, width = 60, height = 80) {
    if (canvas.value && img.value) {
      const ctx = canvas.value.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      let filter = 'none';
      if (tintType === 'hit') {
        filter = 'sepia(1) hue-rotate(-50deg) saturate(2) brightness(1.2)'; // rojo
      } else if (tintType === 'freeze') {
        filter = 'sepia(1) hue-rotate(170deg) saturate(2) brightness(2)'; // azul
      }
      ctx.filter = filter;
      ctx.drawImage(img.value, 0, 0, width, height);
      ctx.filter = 'none';
    }
  }

  function drawKnight(knightCanvas) {
    let tintType = null;
    if (knightFreezeTint.value) tintType = 'freeze';
    else if (knightTint.value) tintType = 'hit';
    drawCharacter(knightCanvas, knightImg, tintType);
  }

  function drawEnemy(enemyCanvas, enemyType = 'orc') {
    
    let tintType = null;
    if (enemyFreezeTint.value) tintType = 'freeze';
    else if (enemyTint.value) tintType = 'hit';
    const enemy = ENEMIES[enemyType];
    const width = enemy.width || 60;
    const height = enemy.height || 80;
    drawCharacter(enemyCanvas, enemyImg, tintType, width, height);
  }

  function loadImages(knightCanvas, enemyCanvas, playerStore) {
    // Draw player image (dynamic) on knightCanvas
    knightImg.value = new Image();
    knightImg.value.onload = () => {
      drawKnight(knightCanvas);
    };
    knightImg.value.src = playerStore.image || 'images/blank.png';

    // Cargar imágenes de enemigos de forma genérica
    Object.entries(enemyTypes).forEach(([type, src]) => {
      const img = new Image();
      img.onload = () => {
        // Solo dibuja si el tipo es el actual
        if (playerStore.enemyType === type && enemyCanvas.value) {
          enemyImg.value = img;
          drawEnemy(enemyCanvas, type);
        }
      };
      img.src = src;
      enemyImgs[type] = img;
    });

    enemyImg.value = undefined;
  }

  // Switch the enemy image according to type and redraw
  function setEnemyType(type, enemyCanvas) {
    enemyImg.value = enemyImgs[type] || new Image();
    if (enemyImg.value.complete && enemyCanvas.value) drawEnemy(enemyCanvas, type);
    else if (enemyImg.value.onload) enemyImg.value.onload = () => drawEnemy(enemyCanvas, type);
  }

  return {
    knightTint,
    knightFreezeTint,
    enemyTint,
    enemyFreezeTint,
    drawKnight,
    drawEnemy,
    loadImages,
    setEnemyType
  };
}