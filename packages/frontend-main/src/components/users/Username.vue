<script lang="ts" setup>
import type { UserAvatarUsernameProps } from './UserAvatarUsername.vue';

import { cn } from '@/utility';
import { shorten } from '@/utility/text';

const props = defineProps<UserAvatarUsernameProps>();
console.log('propsprops', props.size);
</script>

<template>
  <span :class="cn(size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base', !disabled && 'hover:underline decoration-2', 'font-semibold')">{{ shorten(userAddress || '...............', 8, 4) }}</span>
</template>
