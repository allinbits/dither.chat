<script setup lang="ts">
defineProps<{ title: string, disclaimer?: string }>();
</script>

<template>
  <div class="page">
    <h1>{{ title }}</h1>
    <div v-if="disclaimer" class="page__disclaimer">{{ disclaimer }}</div>
    <slot />
  </div>
</template>

<style>
.page {
  padding: 0 10px;
  box-sizing: border-box;
}

.page__disclaimer {
  margin-bottom: 16px;
}
</style>