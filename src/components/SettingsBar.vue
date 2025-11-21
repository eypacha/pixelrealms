<template>
    <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
            <label for="volume" class="mr-2 font-bold">
            <span v-if="Number(soundStore.volume) === 0">🔇</span>
            <span v-else>🔊</span>
            </label>
            <input id="volume" type="range" min="0" max="1" step="0.01" class="w-25" v-model="soundStore.volume" @input="soundStore.setVolume(Number(soundStore.volume))"/>
        </div>
        <div class="flex items-center gap-2">
            <select id="lang" v-model="$i18n.locale" class="border px-2 py-1">
            <option value="es">{{ $t('hud.spanish') }}</option>
            <option value="en">{{ $t('hud.english') }}</option>
            </select>
        </div>
    </div>
</template>

<script setup>
import { useSoundStore } from '../stores/sound';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const soundStore = useSoundStore();
const { locale, t } = useI18n();

const volume = computed({
  get: () => soundStore.volume,
  set: (val) => soundStore.setVolume(Number(val))
});

function setVolume(e) {
  soundStore.setVolume(Number(e.target.value));
}

function setLocale(e) {
  locale.value = e.target.value;
}
</script>

<style scoped>
.w-25 {
  width: 100px;
}
</style>
