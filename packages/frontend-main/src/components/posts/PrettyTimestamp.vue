<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';

const isToggled = ref(false);

const props = defineProps<{ timestamp: Date; isFullDate?: boolean }>();

const date = computed(() => {
    const isSmallScreen = useMediaQuery('(max-width: 800px)');

    if (props.isFullDate || isToggled.value) {
        const formatOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',

            hour12: true,
        };

        if (isSmallScreen.value) {
            return new Intl.DateTimeFormat(undefined, { ...formatOptions }).format(props.timestamp);
        }

        return new Intl.DateTimeFormat(undefined, {
            ...formatOptions,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }).format(props.timestamp);
    }

    const msDiff = Date.now() - props.timestamp.getTime();
    const minuteDiff = msDiff / (1000 * 60);
    if (minuteDiff < 60) {
        return `${Math.floor(minuteDiff)}m`;
    }

    const hoursDiff = msDiff / (1000 * 60 * 60);
    if (hoursDiff >= 1 && hoursDiff < 24) {
        return `${Math.floor(hoursDiff)}h`;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
    }).format(props.timestamp);
});

</script>
<template>
  <button>
    <span class="text-[#B9B9B9] text-xs" @click.stop="isToggled = !isToggled">
      {{ date }}
    </span>
  </button>
</template>
