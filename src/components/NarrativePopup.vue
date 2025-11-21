<template>
  <div v-if="visible" class="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
    <div class="bg-white p-5 text-center  w-100 h-100  flex flex-col justify-center items-center">
        <div class="mb-2 text-2xl flex justify-center gap-2">
          <span v-for="(emoji, i) in getAnecdote().emojis" :key="i">{{ emoji }}</span>
        </div>
        <h2 class="text-lg font-bold mb-2 text-balance">{{ getAnecdote().title }}</h2>
      <p class="mt-2 text-center text-sm text-gray-700 mb-5">{{ getAnecdote().text }}</p>
      <div class="flex flex-col gap-2 items-center w-full">
        <button @click="closePopup" class="px-4 py-1 w-full mt-2 cursor-pointer text-black transition">{{ $t('treasure.continue') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ANECDOTES_EN, ANECDOTES_ES } from '../constants/anecdotes';

const props = defineProps({
  anecdoteIndex: {
    type: Number,
    required: true
  },
  anecdoteLang: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

function getAnecdote() {
  if (props.anecdoteLang === 'es') {
    return ANECDOTES_ES[props.anecdoteIndex] || ANECDOTES_EN[props.anecdoteIndex];
  }
  return ANECDOTES_EN[props.anecdoteIndex] || ANECDOTES_ES[props.anecdoteIndex];
}

function closePopup() {
  emit('close');
}
</script>