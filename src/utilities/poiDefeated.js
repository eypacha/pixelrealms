// src/utilities/poiDefeated.js

export function addDefeatedEnemy(defeatedEnemies, position, type) {
  if (position.offsetX === undefined || position.offsetY === undefined) {
    console.warn('addDefeatedEnemy: falta offsetX/offsetY');
  }
  defeatedEnemies.push({
    type,
    x: position.x,
    y: position.y,
    offsetX: position.offsetX,
    offsetY: position.offsetY
  });
}
