import { onMounted } from 'vue';
import { PLAYER_SPEED } from '../constants/player';
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';

export function usePlayerMovement({ playerStore, terrainCanvas, reactiveCanvas, seedInput, worldOffset, tileStep, addOffset, soundStore, poiStore, playerImage, timeStore, drawAll, maybeTriggerEncounter, currentAnecdote, narrativeActive }) {
  function handleKeyDown(e) {
    if (e.repeat) return;
    if (playerStore.combatActive) return;
    if (narrativeActive.value) return;
    let moved = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      soundStore.playSound('footstep');
      moved = playerStore.moveUp();
      if (!moved) {
        const canvas = terrainCanvas.value;
        if (playerStore.position.y <= PLAYER_SPEED) {
          addOffset(0, -tileStep);
          playerStore.position.y = canvas.height - 1;
          moved = true;
        }
      }
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      soundStore.playSound('footstep');
      moved = playerStore.moveDown();
      if (!moved) {
        const canvas = terrainCanvas.value;
        if (playerStore.position.y >= canvas.height - PLAYER_SPEED) {
          addOffset(0, tileStep);
          playerStore.position.y = 0;
          moved = true;
        }
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      soundStore.playSound('footstep');
      moved = playerStore.moveLeft();
      if (!moved) {
        const canvas = terrainCanvas.value;
        if (playerStore.position.x <= PLAYER_SPEED) {
          addOffset(-tileStep, 0);
          playerStore.position.x = canvas.width - 1;
          moved = true;
        }
      }
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      soundStore.playSound('footstep');
      moved = playerStore.moveRight();
      if (!moved) {
        const canvas = terrainCanvas.value;
        if (playerStore.position.x >= canvas.width - PLAYER_SPEED) {
          addOffset(tileStep, 0);
          playerStore.position.x = 0;
          moved = true;
        }
      }
    }
    if (moved) {
      let terrain = null;
      if (terrainCanvas.value) {
        terrain = generateMidpointDisplacement2D(257, 0.7, worldOffset.value.x, worldOffset.value.y, seedInput.value);
      }
      if (typeof poiStore.ensureForTile === 'function') {
        poiStore.ensureForTile(worldOffset.value.x, worldOffset.value.y, terrain, 800, 600, seedInput.value);
      }
      timeStore.registerMove();
      requestAnimationFrame(() => {
        poiStore.checkDiscovery(playerStore.position, playerStore);
        drawAll(reactiveCanvas, seedInput, playerStore, poiStore, playerImage.value, worldOffset.value, { onlyReactive: true });
        const result = maybeTriggerEncounter();
        if (result && typeof result.index === 'number') {
          currentAnecdote.value = result;
          narrativeActive.value = true;
          poiStore.addNarrativePoi({
            x: playerStore.position.x,
            y: playerStore.position.y,
            offsetX: worldOffset.value.x,
            offsetY: worldOffset.value.y
          }, result);
        }
        if (Array.isArray(poiStore.pois.value)) {
          poiStore.pois.value.forEach(poi => {
            if (poi.type === 'narrative' && Math.abs(poi.position.x - playerStore.position.x) < 10 && Math.abs(poi.position.y - playerStore.position.y) < 10) {
              currentAnecdote.value = poi.narrativeData;
              narrativeActive.value = true;
            }
          });
        }
      });
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  return {
    handleKeyDown
  };
}
