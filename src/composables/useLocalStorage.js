// src/composables/useLocalStorage.js
// Composable para guardar y recuperar el estado del juego en localStorage

const STORAGE_KEY = 'pixelrealms_game_state';

/**
 * Guarda el estado del juego en localStorage
 */
export function saveGameState(state) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Error saving game state:', error);
    return false;
  }
}

/**
 * Recupera el estado del juego desde localStorage
 */
export function loadGameState() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}

/**
 * Elimina el estado del juego de localStorage
 */
export function clearGameState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing game state:', error);
    return false;
  }
}

/**
 * Verifica si existe un estado guardado
 */
export function hasGameState() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Composable principal para usar en los stores
 */
export function useLocalStorage() {
  /**
   * Guarda el estado completo del juego desde los stores
   */
  function saveGame(playerStore, poiStore, timeStore, terrainData) {
    const state = {
      version: 1,
      timestamp: Date.now(),
      player: {
        seed: playerStore.seed,
        position: { x: playerStore.position.x, y: playerStore.position.y },
        oldPosition: { x: playerStore.oldPosition.x, y: playerStore.oldPosition.y },
        health: playerStore.health,
        maxHealth: playerStore.maxHealth,
        strength: playerStore.strength,
        defense: playerStore.defense,
        coins: playerStore.coins,
        inventory: { ...playerStore.inventory },
        steps: playerStore.steps,
        mana: playerStore.mana,
        lastDirection: playerStore.lastDirection,
        darkKnightDefeatedCount: playerStore.darkKnightDefeatedCount,
        defeatedEnemiesCount: playerStore.defeatedEnemiesCount,
        currentOffset: { ...playerStore.currentOffset },
        characterSelected: playerStore.characterSelected,
        character: playerStore.character,
        image: playerStore.image,
      },
      poi: {
        pois: JSON.parse(JSON.stringify(poiStore.pois)),
        poisByTile: JSON.parse(JSON.stringify(poiStore.poisByTile)),
        defeatedEnemies: JSON.parse(JSON.stringify(poiStore.defeatedEnemies)),
        campfire: poiStore.campfire ? JSON.parse(JSON.stringify(poiStore.campfire)) : null,
      },
      time: {
        isNight: timeStore.isNight,
        moveCount: timeStore.moveCount,
      },
      terrain: {
        seedInput: terrainData.seedInput.value,
        worldOffset: { ...terrainData.worldOffset.value },
      }
    };

    return saveGameState(state);
  }

  /**
   * Restaura el estado del juego a los stores
   */
  function loadGame(playerStore, poiStore, timeStore, terrainData) {
    const state = loadGameState();
    if (!state) return false;

    try {
      // Restaurar player store
      if (state.player) {
        playerStore.seed = state.player.seed;
        playerStore.position.x = state.player.position.x;
        playerStore.position.y = state.player.position.y;
        playerStore.oldPosition.x = state.player.oldPosition.x;
        playerStore.oldPosition.y = state.player.oldPosition.y;
        playerStore.health = state.player.health;
        playerStore.maxHealth = state.player.maxHealth;
        playerStore.strength = state.player.strength;
        playerStore.defense = state.player.defense;
        playerStore.coins = state.player.coins;
        playerStore.inventory.potion = state.player.inventory.potion;
        playerStore.steps = state.player.steps;
        playerStore.mana = state.player.mana;
        playerStore.lastDirection = state.player.lastDirection;
        playerStore.darkKnightDefeatedCount = state.player.darkKnightDefeatedCount;
        playerStore.defeatedEnemiesCount = state.player.defeatedEnemiesCount;
        playerStore.currentOffset.x = state.player.currentOffset.x;
        playerStore.currentOffset.y = state.player.currentOffset.y;
        playerStore.characterSelected = state.player.characterSelected;
        playerStore.character = state.player.character;
        playerStore.image = state.player.image;
      }

      // Restaurar poi store
      if (state.poi) {
        poiStore.pois.length = 0;
        state.poi.pois.forEach(p => poiStore.pois.push(p));
        
        // Limpiar y restaurar poisByTile
        Object.keys(poiStore.poisByTile).forEach(k => delete poiStore.poisByTile[k]);
        Object.entries(state.poi.poisByTile).forEach(([k, v]) => {
          poiStore.poisByTile[k] = v;
        });
        
        poiStore.defeatedEnemies.length = 0;
        state.poi.defeatedEnemies.forEach(e => poiStore.defeatedEnemies.push(e));

        // Restaurar campfire
        if (state.poi.campfire) {
          poiStore.campfire = state.poi.campfire;
        }
      }

      // Restaurar time store
      if (state.time) {
        timeStore.isNight = state.time.isNight;
        timeStore.moveCount = state.time.moveCount;
      }

      // Restaurar terrain data
      if (state.terrain && terrainData) {
        terrainData.seedInput.value = state.terrain.seedInput;
        terrainData.worldOffset.value.x = state.terrain.worldOffset.x;
        terrainData.worldOffset.value.y = state.terrain.worldOffset.y;
      }

      return true;
    } catch (error) {
      console.error('Error restoring game state:', error);
      return false;
    }
  }

  return {
    saveGame,
    loadGame,
    clearGameState,
    hasGameState,
    saveGameState,
    loadGameState,
  };
}
