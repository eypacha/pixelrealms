import { ref } from 'vue';

export function useCombatDrawing() {
  const knightImg = ref(null);
  const enemyImg = ref(null);
  const goblinImg = ref(null);
  const darkknightImg = ref(null);
  const knightTint = ref(false);
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
    drawCharacter(knightCanvas, knightImg, knightTint.value ? 'hit' : null);
  }

  function drawEnemy(enemyCanvas) {
    let tintType = null;
    if (enemyFreezeTint.value) tintType = 'freeze';
    else if (enemyTint.value) tintType = 'hit';
    drawCharacter(enemyCanvas, enemyImg, tintType);
  }

  function loadImages(knightCanvas, enemyCanvas) {
    // Draw knight.png on knightCanvas
    knightImg.value = new Image();
    knightImg.value.onload = () => {
      drawKnight(knightCanvas);
    };
    knightImg.value.src = 'images/knight.png';

    // Prepare goblin and darkknight images. We'll point `enemyImg` to the active one.
    goblinImg.value = new Image();
    goblinImg.value.onload = () => {
      // only draw if currently selected
      if (enemyImg.value === goblinImg.value) drawEnemy(enemyCanvas);
    };
    goblinImg.value.src = 'images/goblin.png';

    darkknightImg.value = new Image();
    darkknightImg.value.onload = () => {
      if (enemyImg.value === darkknightImg.value) drawEnemy(enemyCanvas);
    };
    darkknightImg.value.src = 'images/darkknight.png';

    // Default to goblin until changed
    enemyImg.value = goblinImg.value;
    // Attempt initial draw (image may not be loaded yet)
    if (enemyImg.value && enemyCanvas.value) {
      enemyImg.value.onload = () => drawEnemy(enemyCanvas);
    }
  }

  // Switch the enemy image according to type and redraw
  function setEnemyType(type, enemyCanvas) {
    if (type === 'darkknight') {
      enemyImg.value = darkknightImg.value || new Image();
      if (enemyImg.value.complete && enemyCanvas.value) drawEnemy(enemyCanvas);
      else if (enemyImg.value.onload) enemyImg.value.onload = () => drawEnemy(enemyCanvas);
    } else {
      enemyImg.value = goblinImg.value || new Image();
      if (enemyImg.value.complete && enemyCanvas.value) drawEnemy(enemyCanvas);
      else if (enemyImg.value.onload) enemyImg.value.onload = () => drawEnemy(enemyCanvas);
    }
  }

  return {
    knightImg,
    enemyImg,
    knightTint,
    enemyTint,
    enemyFreezeTint,
    drawKnight,
    drawEnemy,
    loadImages,
    setEnemyType
  };
}