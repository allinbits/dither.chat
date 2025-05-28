<script lang="ts" setup>

defineProps<{ message: string }>();

</script>

<template>
  <span class="leading-6 text-sm">
    {{ message }}
  </span>
</template>
