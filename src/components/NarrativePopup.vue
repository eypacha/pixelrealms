<template>
  <div v-if="visible" class="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center  w-100 h-80  flex flex-col justify-center items-center">
      <h2 class="text-lg font-bold mb-2">{{ getAnecdote().title }}</h2>
      <p class="mt-2 text-center text-sm text-gray-700 mb-5">{{ getAnecdote().text }}</p>
      <div class="flex flex-col gap-2 items-center w-full">
        <button @click="closePopup" class="px-4 py-1 w-full mt-2 cursor-pointer text-black transition">{{ $t('treasure.continue') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { anecdotesEn, anecdotesEs } from '../constants/anecdotes';

const props = defineProps({
  anecdoteIndex: {
    type: Number,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);
const { locale } = useI18n();

function getAnecdote() {
  if (locale.value === 'es') {
    return anecdotesEs[props.anecdoteIndex] || anecdotesEn[props.anecdoteIndex];
  }
  return anecdotesEn[props.anecdoteIndex] || anecdotesEs[props.anecdoteIndex];
}

function closePopup() {
  emit('close');
}
</script>