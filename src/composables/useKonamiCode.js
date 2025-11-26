import { ref, onMounted, onUnmounted } from 'vue';

export function useKonamiCode(playerStore) {
  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiIndex = 0;
  const konamiActivated = ref(false);

  function activateKonamiCode() {
    playerStore.coins = 100;
    playerStore.strength = 100;
    playerStore.defense = 100;
    playerStore.health = 100;
    playerStore.maxHealth = 100;
    playerStore.mana = 100;
    konamiActivated.value = true;
  }

  function handleKonamiKey(e) {
    if (e.key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        activateKonamiCode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKonamiKey);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKonamiKey);
  });

  return { konamiActivated };
}
