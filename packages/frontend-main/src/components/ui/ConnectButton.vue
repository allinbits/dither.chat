<script setup lang="ts">
import { Button } from '@/components/ui/button';

defineProps<{ disabled?: boolean }>();
</script>
<template>
  <Button
    class="w-full"
    size="lg"
    :class="{ 'cursor-pointer hover:bg-light hover:text-dark': !disabled, 'opacity-50': disabled }"
    :alt="disabled ? 'Not Installed' : 'Connect'"
    :title="disabled ? 'Not Installed' : 'Connect'"
  >
    <slot name="icon"> </slot>
    <slot></slot>
  </Button>
</template>
