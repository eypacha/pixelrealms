// src/utilities/poiVisibility.js

export function revealPois(pois, playerPosition, radius = 1000) {
  pois.forEach(poi => {
    const dx = poi.position.x - playerPosition.x;
    const dy = poi.position.y - playerPosition.y;
    if (Math.sqrt(dx*dx + dy*dy) <= radius) {
      poi.revealed = true;
    }
  });
}
