<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Number],
    default: 1,
  },
});

const emit = defineEmits([
  'update:modelValue',
]);

const value = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const lost = ref(false);

function handleGameLost(event) {
  lost.value = event.detail.lost;
}

onMounted(() => {
  window.addEventListener('game-lost', handleGameLost);
});
onUnmounted(() => {
  window.removeEventListener('game-lost', handleGameLost);
});

function restart() {
  window.location.reload();
}
</script>

<template>
  <div>
    <dl id="debug">
      <dt>scale: {{ value }}</dt>
      <input v-model.number="value" type="range" min="0.2" max="1" step="0.05">
    </dl>
    <div v-if="lost" id="lostPopup">
      <h1>You Lost!</h1>
      <button @click="restart">Restart</button>
    </div>
  </div>
</template>

<style scoped>
#overlay {
  z-index: 1000;
}

:xr-overlay {
  z-index: inherit;
}

/* in AR z-index is not supported for AR dom overlay */

#debug {
  position: absolute;
  left: 20px;
  bottom: 20px;
  background-color: black;
  color: white;
  width: auto;
  padding: 0.5rem 1rem;
  font-family: monospace;
}

dt {
  margin-top: 0.5rem;
  font-weight: bold;
}

dd {
  margin-left: 0.5rem;
}


#lostPopup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
</style>