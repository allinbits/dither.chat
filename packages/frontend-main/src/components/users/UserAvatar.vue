<script lang="ts" setup>
import { useColorMode } from '@vueuse/core';

import Avatar from '../ui/avatar/Avatar.vue';
import AvatarFallback from '../ui/avatar/AvatarFallback.vue';
import AvatarImage from '../ui/avatar/AvatarImage.vue';

import { cn } from '@/utility';

export interface UserAvatarProps {
    userAddress?: string;
    size?: 'lg' | 'md';
}
defineProps<UserAvatarProps>();

const mode = useColorMode();

</script>

<template>
  <Avatar :class="cn(size === 'lg' ? 'size-[64px]' : 'size-[40px]')">
    <!-- <div v-if="!userAddress" class="size-full bg-[#D9D9D9]"/> -->
    <AvatarImage v-if="userAddress" :class="mode === 'dark' && 'filter-[invert(0.96))]'" :src="`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${userAddress}`" alt="user-avatar-image" />
    <AvatarFallback v-else class="bg-[#D9D9D9] size-full"/>
  </Avatar>

</template>
