<script setup lang="ts">
import { ref } from 'vue';
import { format, formatDistanceToNowStrict } from 'date-fns';

defineProps<{ timestamp: Date }>();
const isToNow = ref(true);

</script>
<template>
  <button @click.stop="isToNow = !isToNow">
    <span class="text-[#B9B9B9] text-sm">{{ isToNow ? formatDistanceToNowStrict(timestamp) : format(timestamp, "Pp") }}</span>
  </button>
</template>
