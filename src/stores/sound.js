import { defineStore } from 'pinia';
import { Howl } from 'howler';

export const useSoundStore = defineStore('sound', () => {
  // Sounds
  const hammerSound = new Howl({ src: ['/sounds/hammer.wav'] });
  const klingSound = new Howl({ src: ['/sounds/kling.wav'] });
  const whoshSound = new Howl({ src: ['/sounds/whosh.wav'] });

  function playHammer() {
    hammerSound.play();
  }

  function playKling() {
    klingSound.play();
  }

  function playWhosh() {
    whoshSound.play();
  }

  return {
    playHammer,
    playKling,
    playWhosh
  };
});