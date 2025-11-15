import { ref } from 'vue';

export function useCombatDrawing() {
  const knightImg = ref(null);
  const enemyImg = ref(null);
  const knightTint = ref(false);
  const enemyTint = ref(false);

  function drawCharacter(canvas, img, isTinted) {
    if (canvas.value && img.value) {
      const ctx = canvas.value.getContext('2d');
      ctx.clearRect(0, 0, 60, 80);
      ctx.imageSmoothingEnabled = false;
      ctx.filter = isTinted ? 'sepia(1) hue-rotate(-50deg) saturate(2) brightness(1.2)' : 'none';
      ctx.drawImage(img.value, 0, 0, 60, 80);
      ctx.filter = 'none';
    }
  }

  function drawKnight(knightCanvas) {
    drawCharacter(knightCanvas, knightImg, knightTint.value);
  }

  function drawEnemy(enemyCanvas) {
    drawCharacter(enemyCanvas, enemyImg, enemyTint.value);
  }

  function loadImages(knightCanvas, enemyCanvas) {
    // Draw knight.png on knightCanvas
    knightImg.value = new Image();
    knightImg.value.onload = () => {
      drawKnight(knightCanvas);
    };
    knightImg.value.src = '/images/knight.png';

    // Draw goblin.png on enemyCanvas
    enemyImg.value = new Image();
    enemyImg.value.onload = () => {
      drawEnemy(enemyCanvas);
    };
    enemyImg.value.src = '/images/goblin.png';
  }

  return {
    knightImg,
    enemyImg,
    knightTint,
    enemyTint,
    drawKnight,
    drawEnemy,
    loadImages
  };
}