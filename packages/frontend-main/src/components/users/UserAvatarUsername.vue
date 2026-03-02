<script lang="ts" setup>
import { cn } from '@/utility';

import UserAvatar from './UserAvatar.vue';
import Username from './Username.vue';

export interface UserAvatarUsernameProps {
  userAddress?: string;
  size?: 'lg' | 'md' | 'sm';
  disabled?: boolean;
}

const props = defineProps<UserAvatarUsernameProps>();
</script>

<template>
  <div :class="cn('flex flex-row items-center', size === 'lg' ? 'gap-4' : size === 'sm' ? 'gap-2' : 'gap-3')">
    <UserAvatar v-bind="props" />
    <div class="flex flex-col gap-2">
      <Username v-bind="props" />
      <slot />
    </div>
  </div>
</template>
