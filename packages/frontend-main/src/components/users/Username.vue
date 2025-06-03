<script lang="ts" setup>
import { shorten } from '@/utility/text';

defineProps<{ userAddress?: string }>();

</script>

<template>
  <span class='font-semibold text-base'>{{ shorten(userAddress || '...............', 8, 4) }}</span>
</template>
