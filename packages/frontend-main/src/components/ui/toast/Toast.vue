<script setup lang="ts">
import type { ToastRootEmits, ToastRootProps } from 'reka-ui';

import { onBeforeUnmount, onMounted, ref } from 'vue';
import { ToastProvider, ToastRoot, ToastViewport, useForwardPropsEmits } from 'reka-ui';

const DEFAULT_DURATION = 2_000;

const props = withDefaults(defineProps<ToastRootProps & { duration?: number }>(), {
    duration: DEFAULT_DURATION,
});
const emits = defineEmits<ToastRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);

const progress = ref(100);
let startTime = 0;
let frame: number | null = null;

function animate() {
    const elapsed = Date.now() - startTime;
    progress.value = Math.max(0, 100 - (elapsed / props.duration) * 100);
    if (progress.value > 0) {
        frame = requestAnimationFrame(animate);
    }
}

function startProgress() {
    startTime = Date.now();
    progress.value = 100;
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(animate);
}

onMounted(() => {
    startProgress();
});

onBeforeUnmount(() => {
    if (frame) cancelAnimationFrame(frame);
});
</script>

<template>
  <ToastProvider :duration="duration">
    <ToastRoot
      data-slot="toast"
      v-bind="forwarded"
      class="bg-white rounded-lg shadow-lg border p-4 flex flex-col gap-2 relative min-w-0 max-w-full data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
    >
      <!-- Close Icon -->
      <button
        @click="$emit('update:open', false)"
        class="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Close"
        tabindex="0"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="flex flex-col items-center gap-2 mt-1">
        <slot />
      </div>

      <!-- Progress Bar -->
      <div
        class="absolute left-0 bottom-0 h-1 w-full bg-gray-200 overflow-hidden rounded-b-lg"
      >
        <div
          class="h-full bg-primary transition-all duration-100 linear"
          :style="{ width: progress + '%', transition: 'width 100ms linear' }"
        />
      </div>
    </ToastRoot>
    <ToastViewport class="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
  </ToastProvider>
</template>
