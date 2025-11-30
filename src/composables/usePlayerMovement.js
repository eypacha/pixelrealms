import { onMounted } from 'vue';
import { useCombatStore } from '../stores/combat';
import { PLAYER_SPEED } from '../constants/player';
import { generateMidpointDisplacement2D } from '../utilities/midpointDisplacement2D';

export function usePlayerMovement({ playerStore, terrainCanvas, reactiveCanvas, seedInput, worldOffset, tileStep, addOffset, soundStore, poiStore, playerImage, timeStore, drawAll, maybeTriggerEncounter, currentAnecdote, narrativeActive }) {

  const combatStore = useCombatStore();

  function handleKeyDown(e) {
    if (e.repeat) return;
    if (combatStore.combatActive) return;
    if (playerStore.gameOver) return;
    if (!playerStore.characterSelected) return;
    if (narrativeActive.value) return;
    if (poiStore.treasureDiscovered) return; // Bloquea movimiento si el popup de tesoro está abierto
    let moved = false;
    const key = String(e.key).toLowerCase();
    const directions = [
      {
        keys: ['arrowup', 'w'],
        move: () => playerStore.moveUp(),
        shouldWrap: () => playerStore.position.y <= PLAYER_SPEED,
        wrap: (canvas) => {
          addOffset(0, -tileStep);
          playerStore.position.y = canvas.height - 1;
        }
      },
      {
        keys: ['arrowdown', 's'],
        move: () => playerStore.moveDown(),
        shouldWrap: () => playerStore.position.y >= canvas.height - PLAYER_SPEED,
        wrap: (canvas) => {
          addOffset(0, tileStep);
          playerStore.position.y = 0;
        }
      },
      {
        keys: ['arrowleft', 'a'],
        move: () => playerStore.moveLeft(),
        shouldWrap: () => playerStore.position.x <= PLAYER_SPEED,
        wrap: (canvas) => {
          addOffset(-tileStep, 0);
          playerStore.position.x = canvas.width - 1;
        }
      },
      {
        keys: ['arrowright', 'd'],
        move: () => playerStore.moveRight(),
        shouldWrap: () => playerStore.position.x >= canvas.width - PLAYER_SPEED,
        wrap: (canvas) => {
          addOffset(tileStep, 0);
          playerStore.position.x = 0;
        }
      }
    ];

    // find the direction matching the pressed key
    const dir = directions.find(d => d.keys.includes(key));
    if (dir) {
      moved = dir.move();
      if (!moved) {
        const canvas = terrainCanvas.value;
        if (dir.shouldWrap()) {
          dir.wrap(canvas);
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
