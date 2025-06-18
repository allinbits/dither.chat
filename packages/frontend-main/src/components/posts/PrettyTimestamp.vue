<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ timestamp: Date; isFullDate?: boolean }>();

const date = computed(() => {
    if (props.isFullDate) {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).format(props.timestamp);
    }

    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(props.timestamp);
});

</script>
<template>
  <button>
    <span class="text-[#B9B9B9] text-xs">{{ date }}</span>
  </button>
</template>
