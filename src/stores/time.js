import { ref } from 'vue';

// Store para ciclo día/noche
export const useTimeStore = () => {
  const isNight = ref(false);
  const moveCount = ref(0);

  function registerMove() {
    moveCount.value++;
    if (moveCount.value % 10 === 0) {
      isNight.value = !isNight.value;
    }
  }

  function resetTime() {
    moveCount.value = 0;
    isNight.value = false;
  }

  return { isNight, moveCount, registerMove, resetTime };
};
