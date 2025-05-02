<script setup lang="ts">
defineProps<{ disabled?: boolean }>();
</script>
<template>
  <div
    class="flex flex-inline px-6 py-3 align-left rounded-lg items-center bg-button text-light"
    :class="{ 'cursor-pointer hover:bg-light hover:text-dark': !disabled, 'opacity-50': disabled }"
    :alt="disabled ? 'Not Installed' : 'Connect'"
    :title="disabled ? 'Not Installed' : 'Connect'"
  >
    <slot name="icon"> </slot>
    <slot></slot>
  </div>
</template>