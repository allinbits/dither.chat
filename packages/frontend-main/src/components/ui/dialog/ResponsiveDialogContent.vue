<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { useMediaQuery } from '@vueuse/core';
import { X } from 'lucide-vue-next';
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { cn } from '@/utility';

import DialogOverlay from './DialogOverlay.vue';

interface ResponsiveDialogContentProps extends DialogContentProps {
  class?: HTMLAttributes['class'];
  showCloseButton?: boolean;
}

const props = withDefaults(defineProps<ResponsiveDialogContentProps>(), {
  showCloseButton: true,
});

const emits = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
  const { class: _, showCloseButton: __, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);

// Mobile detection (640px breakpoint)
const isMobile = useMediaQuery('(max-width: 640px)');

// Drag state
const isDragging = ref(false);
const dragY = ref(0);
const contentRef = ref<HTMLElement | null>(null);

// Touch/pointer event handlers
let startY = 0;
let currentY = 0;
let isPointerDown = false;
let startTime = 0;

function handlePointerDown(e: PointerEvent | TouchEvent) {
  if (!isMobile.value) return;

  // Don't start drag if clicking on the close button or its children
  const target = e.target as HTMLElement;
  const closeButton = contentRef.value?.querySelector('[data-slot="dialog-close"]') as HTMLElement;
  if (closeButton && closeButton.contains(target)) {
    return;
  }

  // Check if the content is scrollable and not at the top
  const dialogContent = contentRef.value?.querySelector('[data-slot="dialog-content"]') as HTMLElement;
  if (dialogContent && dialogContent.scrollTop > 0) {
    // Allow scrolling if content is scrollable
    return;
  }

  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  startY = clientY;
  currentY = clientY;
  startTime = Date.now();
  isPointerDown = true;
  isDragging.value = true;

  // Prevent default scrolling behavior
  if (e instanceof TouchEvent) {
    e.preventDefault();
  }
}

function handlePointerMove(e: PointerEvent | TouchEvent) {
  if (!isMobile.value || !isPointerDown) return;

  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  const deltaY = clientY - startY;

  // Only allow downward drag
  if (deltaY > 0) {
    currentY = clientY;
    dragY.value = deltaY;
  }

  // Prevent default scrolling behavior
  if (e instanceof TouchEvent) {
    e.preventDefault();
  }
}

function handlePointerUp() {
  if (!isMobile.value || !isPointerDown) return;

  isPointerDown = false;
  const threshold = 100;
  const timeDelta = Date.now() - startTime;
  const distance = Math.abs(currentY - startY);
  const velocity = timeDelta > 0 ? distance / timeDelta : 0;

  // Close if dragged down past threshold or with sufficient velocity
  if (dragY.value > threshold || (dragY.value > 50 && velocity > 0.5)) {
    handleClose();
  } else {
    // Snap back to original position
    dragY.value = 0;
  }

  isDragging.value = false;
}

function handleClose() {
  const closeButton = contentRef.value?.querySelector(
    '[data-slot="dialog-close"]',
  ) as HTMLButtonElement;
  if (closeButton) {
    closeButton.click();
  } else {
    // Fallback: dispatch escape key event
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      bubbles: true,
    });
    document.dispatchEvent(escapeEvent);
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('touchcancel', handlePointerUp);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', handlePointerUp);
    window.removeEventListener('touchcancel', handlePointerUp);
  }
});

const contentStyle = computed(() => {
  if (!isMobile.value) {
    // On desktop, return empty object - no wrapper styling needed
    return {};
  }
  // On mobile, use fixed positioning to ensure it's always visible
  if (isDragging.value) {
    return {
      position: 'fixed' as const,
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: '51',
      transform: `translateY(${dragY.value}px)`,
      transition: 'none',
    };
  }
  return {
    position: 'fixed' as const,
    bottom: '0',
    left: '0',
    right: '0',
    zIndex: '51',
    transform: 'translateY(0)',
    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  };
});

const overlayOpacity = computed(() => {
  if (!isMobile.value || !isDragging.value) {
    return undefined;
  }
  const maxDrag = 200;
  return Math.max(0.3, 1 - dragY.value / maxDrag);
});

const overlayStyle = computed(() => {
  if (overlayOpacity.value === undefined) {
    return {};
  }
  return {
    opacity: overlayOpacity.value.toString(),
    transition: 'opacity 75ms',
  };
});
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      :style="overlayStyle"
      :class="overlayOpacity !== undefined ? 'transition-opacity duration-75' : ''"
    />
    <!-- Mobile: Wrapper div for drag functionality -->
    <div
      v-if="isMobile"
      ref="contentRef"
      :style="contentStyle"
      :class="[
        !isDragging ? 'transition-transform duration-200 ease-out' : '',
      ]"
      @pointerdown="handlePointerDown"
      @touchstart="handlePointerDown"
    >
      <DialogContent
        data-slot="dialog-content"
        v-bind="forwarded"
        :class="
          cn(
            // Positioning
            'fixed right-0 bottom-[58px] left-0 z-[51]',
            // Layout
            'grid max-h-[90vh] w-full gap-4',
            // Overflow
            'overflow-y-auto',
            // Styling
            'rounded-t-lg border-t border-r border-l bg-background',
            // Spacing
            'pb-[max(1.5rem,env(safe-area-inset-bottom))]',
            // Effects
            'shadow-lg duration-200',
            // Animations
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom',
            props.class,
          )
        "
        :style="{
          touchAction: 'pan-y',
          pointerEvents: 'auto',
        }"
      >
        <div class="sticky top-0 right-0 left-0 isolate grid place-items-center bg-gradient-to-b from-background py-4">
          <!-- Drag handle -->
          <div
            class="mx-auto mb-2 h-1 w-12 rounded-full bg-muted-foreground/30 pointer-events-none"
            aria-hidden="true"
          />

          <DialogClose
            v-if="showCloseButton"
            data-slot="dialog-close"
            class="absolute top-4 right-4 z-10 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <X />
            <span class="sr-only">Close</span>
          </DialogClose>
        </div>

        <div class="px-5 md:px-6 flex flex-col gap-4">
          <slot />
        </div>
      </DialogContent>
    </div>
    <!-- Desktop: Render DialogContent directly (matches DialogContent.vue exactly) -->
    <DialogContent
      v-else
      data-slot="dialog-content"
      v-bind="forwarded"
      :class="
        cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          props.class,
        )
      "
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      >
        <X />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
