<script lang="ts" setup>
import { shorten } from '@/utility/text';

defineProps<{ userAddress?: string }>();

</script>

<template>
  <span class='font-semibold text-base hover:underline decoration-2'>{{ shorten(userAddress || '...............', 8, 4) }}</span>
</template>
