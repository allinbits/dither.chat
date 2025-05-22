<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { useVModel } from '@vueuse/core';

import { cn } from '@/utility';

const props = defineProps<{
    class?: HTMLAttributes['class'];
    defaultValue?: string | number;
    modelValue?: string | number;
}>();

const emits = defineEmits<{
    (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: props.defaultValue,
});
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :class="cn('placeholder:text-neutral-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50', props.class)"
  />
</template>
