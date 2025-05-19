<script lang="ts" setup>
import { useColorMode } from '@vueuse/core';

import Avatar from './avatar/Avatar.vue';
import AvatarFallback from './avatar/AvatarFallback.vue';
import AvatarImage from './avatar/AvatarImage.vue';

import { cn } from '@/lib/utils';

export interface UserAvatarProps {
    userAddress?: string;
    size?: 'lg' | 'md' | 'sm';
}
defineProps<UserAvatarProps>();

const mode = useColorMode();

</script>

<template>
  <Avatar :class="cn(size === 'lg' ? 'size-[64px]' : size === 'sm' ? 'size-[32px]' : 'size-[40px]')">
    <div v-if="!userAddress" class="size-[40px] bg-[#D9D9D9]"/>
    <AvatarImage v-else :class="mode === 'dark' && 'filter-[invert(0.96))]'" :src="`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${userAddress}`" alt="user-avatar-image" />
    <AvatarFallback class="bg-[#D9D9D9]"/>
  </Avatar>

</template>
