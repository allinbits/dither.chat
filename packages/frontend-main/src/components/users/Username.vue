<script lang="ts" setup>
import type { UserAvatarUsernameProps } from './UserAvatarUsername.vue';

import { cn } from '@/utility';
import { shorten } from '@/utility/text';

defineProps<UserAvatarUsernameProps>();
</script>

<template>
  <span :class="cn(size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base', !disabled && 'active:underline hover:underline decoration-2', 'font-semibold')">{{ shorten(userAddress || '...............', 8, 4) }}</span>
</template>
