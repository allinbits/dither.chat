<script setup lang="ts">
import { ref } from 'vue';
import { format, formatDistanceToNowStrict } from 'date-fns';

const props = defineProps<{ timestamp: Date; isFullDate?: boolean }>();
const isToNow = ref(!props.isFullDate);

</script>
<template>
  <button @click.stop="isToNow = !isToNow">
    <span class="text-[#B9B9B9] text-sm">{{ isToNow ? formatDistanceToNowStrict(timestamp) : format(timestamp, "Pp") }}</span>
  </button>
</template>
