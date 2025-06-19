<script setup lang="ts">
import { computed, ref } from 'vue';

const isToggled = ref(false);

const props = defineProps<{ timestamp: Date; isFullDate?: boolean }>();

const date = computed(() => {
    if (props.isFullDate || isToggled.value) {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).format(props.timestamp);
    }

    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(props.timestamp);
});

</script>
<template>
  <button>
    <span class="text-[#B9B9B9] text-xs" @click.stop="isToggled = !isToggled">{{ date }}</span>
  </button>
</template>
