<script lang="ts" setup>
import UserAvatar, { type UserAvatarProps } from './UserAvatar.vue';

import { cn } from '@/utility';
import { shorten } from '@/utility/text';

defineProps<UserAvatarProps>();

</script>

<template>
  <div :class="cn('flex flex-row items-center', size === 'lg' ? 'gap-4' : 'gap-3')">
    <UserAvatar :userAddress="userAddress" :size="size"/>
    <span :class="cn('w-[132px] font-semibold', size === 'lg' && 'text-lg')">{{ shorten(userAddress || '...............', 8, 4) }}</span>
  </div>
</template>
