<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { X } from 'lucide-vue-next';
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogRoot,
  DialogTrigger,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui';
import { computed } from 'vue';

import { cn } from '@/utility';

import DialogOverlay from '../dialog/DialogOverlay.vue';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    modal?: boolean;
  }>(),
  {
    modal: false,
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const isMobile = useMediaQuery('(max-width: 640px)');

const openModel = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
});
</script>

<template>
  <!-- Mobile: Dialog -->
  <DialogRoot v-if="isMobile" v-model:open="openModel">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="z-[99] opacity-45" />
      <DialogContent
        data-slot="dialog-content"
        :class="
          cn(
            'z-[100] bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          )
        "
      >
        <slot />

        <DialogClose
          class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <X />
          <span class="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <!-- Desktop: Popover -->
  <PopoverRoot v-else v-model:open="openModel" :modal="modal">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        data-slot="popover-content"
        :class="
          cn(
            'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md origin-(--reka-popover-content-transform-origin) outline-hidden',
          )
        "
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
