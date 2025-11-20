// Composable para activar encuentros narrativos aleatorios
import { anecdotesEn, anecdotesEs } from '../constants/anecdotes';
import { useI18n } from 'vue-i18n';

export function useNarrativeEncounter() {
  // Probabilidad de activar un encuentro narrativo (por ejemplo, 100% para debugguear)
  const CHANCE = 0.2;
  const { locale } = useI18n();

  function maybeTriggerEncounter() {
    if (Math.random() < CHANCE) {
      let arr = locale.value === 'es' ? anecdotesEs : anecdotesEn;
      if (!arr || arr.length === 0) arr = anecdotesEn;
      const index = Math.floor(Math.random() * arr.length);
      return { index, lang: locale.value };
    }
    return null;
  }

  return {
    maybeTriggerEncounter
  };
}
