import { defineStore } from 'pinia';
import { Howl } from 'howler';
import { ref } from 'vue';

export const useSoundStore = defineStore('sound', () => {
  // Global volume (0.0 - 1.0)
  const volume = ref(0.2);
  // Sounds
  const sounds = {
    hammer: new Howl({ src: ['sounds/hammer.wav'], volume: volume.value }),
    kling: new Howl({ src: ['sounds/kling.wav'], volume: volume.value }),
    whosh: new Howl({ src: ['sounds/whosh.wav'], volume: volume.value }),
    coin: new Howl({ src: ['sounds/coin.mp3'], volume: volume.value }),
    gulp: new Howl({ src: ['sounds/gulp.wav'], volume: volume.value }),
    fireball: new Howl({ src: ['sounds/fireball.wav'], volume: volume.value }),
    freeze: new Howl({ src: ['sounds/freeze.wav'], volume: volume.value }),
  };

  function setVolume(val) {
    volume.value = val;
    Object.values(sounds).forEach(s => s.volume(val));
  }

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
    volume,
    setVolume,
  };
});