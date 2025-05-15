<script lang="ts" setup>
import UserAvatar, { type UserAvatarProps } from './UserAvatar.vue';
import Username from './Username.vue';

import { cn } from '@/lib/utils';

defineProps<UserAvatarProps>();

</script>

<template>
  <div :class="cn('flex flex-row items-center', size === 'lg' ? 'gap-4' : 'gap-3')">
    <UserAvatar :userAddress="userAddress" :size="size"/>
    <Username :userAddress="userAddress" :class="size === 'lg' ? 'text-lg' : 'text-sm'" />
  </div>
</template>
