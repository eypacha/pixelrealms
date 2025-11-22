import { ref } from 'vue';

export function useCombatDrawing() {
  const knightImg = ref(null);
  const enemyImg = ref(null);
  // Mapa para imágenes de enemigos
  const enemyImgs = {};
  // Definición de tipos y rutas
  const enemyTypes = {
    goblin: 'images/goblin.png',
    orc: 'images/medium-orc.png',
    darkknight: 'images/darkknight.png',
    skeleton: 'images/skeleton.png', // Nuevo enemigo
    // Agrega aquí más enemigos fácilmente
  };
  const knightTint = ref(false);
  const knightFreezeTint = ref(false);
  const enemyTint = ref(false);
  const enemyFreezeTint = ref(false);

  function drawCharacter(canvas, img, tintType) {
    if (canvas.value && img.value) {
      const ctx = canvas.value.getContext('2d');
      ctx.clearRect(0, 0, 60, 80);
      ctx.imageSmoothingEnabled = false;
      let filter = 'none';
      if (tintType === 'hit') {
        filter = 'sepia(1) hue-rotate(-50deg) saturate(2) brightness(1.2)'; // rojo
      } else if (tintType === 'freeze') {
        filter = 'sepia(1) hue-rotate(170deg) saturate(2) brightness(2)'; // azul
      }
      ctx.filter = filter;
      ctx.drawImage(img.value, 0, 0, 60, 80);
      ctx.filter = 'none';
    }
  }

  function drawKnight(knightCanvas) {
    let tintType = null;
    if (knightFreezeTint.value) tintType = 'freeze';
    else if (knightTint.value) tintType = 'hit';
    drawCharacter(knightCanvas, knightImg, tintType);
  }

  function drawEnemy(enemyCanvas) {
    let tintType = null;
    if (enemyFreezeTint.value) tintType = 'freeze';
    else if (enemyTint.value) tintType = 'hit';
    drawCharacter(enemyCanvas, enemyImg, tintType);
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
        if (enemyImg.value === img) drawEnemy(enemyCanvas);
      };
      img.src = src;
      enemyImgs[type] = img;
    });

    // Por defecto, selecciona el orc
    enemyImg.value = enemyImgs.orc;
    if (enemyImg.value && enemyCanvas.value) {
      enemyImg.value.onload = () => drawEnemy(enemyCanvas);
    }
  }

  // Switch the enemy image according to type and redraw
  function setEnemyType(type, enemyCanvas) {
    enemyImg.value = enemyImgs[type] || new Image();
    if (enemyImg.value.complete && enemyCanvas.value) drawEnemy(enemyCanvas);
    else if (enemyImg.value.onload) enemyImg.value.onload = () => drawEnemy(enemyCanvas);
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