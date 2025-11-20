// Composable para activar encuentros narrativos aleatorios
import { ANECDOTES_EN, ANECDOTES_ES, ANECDOTE_CHANCHE } from '../constants/anecdotes';
import { useI18n } from 'vue-i18n';

export function useNarrativeEncounter() {
  // Probabilidad de activar un encuentro narrativo (por ejemplo, 100% para debugguear)
  const { locale } = useI18n();

  function maybeTriggerEncounter() {
    if (Math.random() < ANECDOTE_CHANCHE) {
      let arr = locale.value === 'es' ? ANECDOTES_ES : ANECDOTES_EN;
      if (!arr || arr.length === 0) arr = ANECDOTES_EN;
      const index = Math.floor(Math.random() * arr.length);
      return { index, lang: locale.value };
    }
    return null;
  }

  return {
    maybeTriggerEncounter
  };
}
