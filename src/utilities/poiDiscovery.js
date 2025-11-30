// src/utilities/poiDiscovery.js

import { useCombatStore } from '../stores/combat';

export function checkPoisDiscovery(pois, playerPosition, playerStore, treasureDiscoveredRef) {
  pois.forEach(poi => {
    if (
      (poi.type === 'narrative' && Math.abs(poi.position.x - playerPosition.x) < 10 && Math.abs(poi.position.y - playerPosition.y) < 10)
      || (!poi.discovered && Math.abs(poi.position.x - playerPosition.x) < 10 && Math.abs(poi.position.y - playerPosition.y) < 10)
    ) {
      if (poi.type !== 'narrative') poi.discovered = true;
      if (poi.type === 'darkknight') {
        useCombatStore().startCombat('darkknight', playerStore);
      } else if (poi.type === 'dragon') {
        useCombatStore().startCombat('dragon', playerStore);
      } else if (poi.type === 'wizard') {
        playerStore.wizardActive = true;
      } else if (poi.type === 'treasure') {
        if (treasureDiscoveredRef) treasureDiscoveredRef.value = true;
      } else if (poi.type === 'narrative') {
        if (typeof playerStore.showNarrative === 'function') {
          playerStore.showNarrative(poi.narrativeData);
        }
      }
    }
  });
}
