// Composable para activar encuentros narrativos aleatorios
import { anecdotes } from '../constants/anecdotes';

export function useNarrativeEncounter() {
  // Probabilidad de activar un encuentro narrativo (por ejemplo, 100% para debugguear)
  const CHANCE = 0.2;

  function maybeTriggerEncounter() {
    if (Math.random() < CHANCE) {
      // Selecciona una anécdota al azar
      const index = Math.floor(Math.random() * anecdotes.length);
      return anecdotes[index];
    }
    return null;
  }

  return {
    maybeTriggerEncounter
  };
}
