<script lang="ts" setup>
const props = defineProps<{ message: string }>();

</script>

<template>
  <div
    class="leading-6 text-sm"
  >{{ props.message }}</div>
</template>
