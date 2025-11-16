import { defineStore } from 'pinia';
import { Howl } from 'howler';

export const useSoundStore = defineStore('sound', () => {
  // Sounds
  const sounds = {
    hammer: new Howl({ src: ['/sounds/hammer.wav'] }),
    kling: new Howl({ src: ['/sounds/kling.wav'] }),
    whosh: new Howl({ src: ['/sounds/whosh.wav'] }),
    coin: new Howl({ src: ['/sounds/coin.mp3'] }),
    gulp: new Howl({ src: ['/sounds/gulp.wav'] }),
  };

  function playSound(name) {
    const s = sounds[name];
    if (!s) {
      console.warn(`Sound not found: ${name}`);
      return;
    }
    try {
      s.play();
    } catch (e) {
      console.error('Failed to play sound', name, e);
    }
  }

  return {
    playSound,
  };
});