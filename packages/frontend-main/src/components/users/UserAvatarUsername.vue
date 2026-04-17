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
    <div class="flex flex-col gap-2 min-w-0">
      <Username v-bind="props">
        <template v-if="$slots.username" #default="slotProps">
          <slot name="username" v-bind="slotProps" />
        </template>
      </Username>
      <slot />
    </div>
  </div>
</template>
