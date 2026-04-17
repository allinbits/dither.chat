<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { useClipboard } from '@vueuse/core';
import { Check, Copy } from 'lucide-vue-next';
import { computed, onBeforeUnmount, ref, useSlots } from 'vue';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utility';

const props = withDefaults(defineProps<{
  text: string;
  class?: HTMLAttributes['class'];
  copyTooltip?: string;
  copiedTooltip?: string;
  copiedDuring?: number;
  openDelay?: number;
}>(), {
  class: undefined,
  copyTooltip: 'Copy',
  copiedTooltip: 'Copied',
  copiedDuring: 1500,
  openDelay: 500,
});

const slots = useSlots();
const { copy, copied } = useClipboard({ copiedDuring: props.copiedDuring });
const isTooltipOpen = ref(false);
let closeTimeout: ReturnType<typeof setTimeout> | null = null;
let openTimeout: ReturnType<typeof setTimeout> | null = null;

const tooltipText = computed(() => copied.value ? props.copiedTooltip : props.copyTooltip);
const hasDefaultSlot = computed(() => !!slots.default);

function onCopy() {
  if (closeTimeout) clearTimeout(closeTimeout);
  copy(props.text);
  isTooltipOpen.value = true;

  closeTimeout = setTimeout(() => {
    isTooltipOpen.value = false;
    closeTimeout = null;
  }, props.copiedDuring);
}

function onPointerEnter() {
  if (closeTimeout) return;
  if (openTimeout) clearTimeout(openTimeout);
  openTimeout = setTimeout(() => {
    isTooltipOpen.value = true;
    openTimeout = null;
  }, props.openDelay);
}

function onPointerLeave() {
  if (openTimeout) {
    clearTimeout(openTimeout);
    openTimeout = null;
  }
  if (closeTimeout) return;
  isTooltipOpen.value = false;
}

onBeforeUnmount(() => {
  if (closeTimeout) clearTimeout(closeTimeout);
  if (openTimeout) clearTimeout(openTimeout);
});
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <Tooltip :open="isTooltipOpen">
      <TooltipTrigger as-child>
        <button
          type="button"
          :class="cn('inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', props.class)"
          @click="onCopy"
          @mouseenter="onPointerEnter"
          @mouseleave="onPointerLeave"
          @focus="onPointerEnter"
          @blur="onPointerLeave"
        >
          <slot v-if="hasDefaultSlot" />
          <template v-else>
            <Check v-if="copied" class="size-3.5" />
            <Copy v-else class="size-3.5" />
          </template>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span>{{ tooltipText }}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
