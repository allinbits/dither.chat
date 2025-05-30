<script setup lang="ts">
import type { ToastRootEmits, ToastRootProps } from 'reka-ui';

import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ToastProvider, ToastRoot, ToastViewport, useForwardPropsEmits } from 'reka-ui';

import { useToast } from '@/composables/useToast';

const { hideToast, title, desc, open } = useToast();

const props = defineProps<ToastRootProps>();
const emits = defineEmits<ToastRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);

const DEFAULT_DURATION = 3000;

const duration = DEFAULT_DURATION;
const progress = ref(100);
let startTime = 0;
let frame: number | null = null;

function animate() {
    const elapsed = Date.now() - startTime;
    progress.value = Math.max(0, 100 - (elapsed / duration) * 100);
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
  <ToastProvider>
    <ToastRoot
      data-slot="toast"
      v-bind="forwarded"
      class="bg-white rounded-lg shadow-lg border p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center relative data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
    >
      <slot />
      <div
        class="absolute left-0 bottom-0 h-1 w-full bg-gray-200 overflow-hidden rounded-b-lg"
        style="grid-column: 1 / -1"
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
