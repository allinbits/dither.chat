<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import PostActions from '../posts/PostActions.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import PostMessage from './PostMessage.vue';
import PostMoreActions from './PostMoreActions.vue';

defineProps<{ post: Post }>();

</script>

<template>
  <RouterLink :to="`/post/${post.hash}`" custom v-slot="{ navigate }">
    <div class="flex flex-row gap-3 border-b cursor-pointer">
      <RouterLink :to="`/profile/${post.author}`">
        <UserAvatar :userAddress="post.author" />
      </RouterLink>

      <div class="flex flex-col w-full gap-3" @click="navigate">
        <div class="flex flex-row justify-between items-center h-[40px]">
          <div class="flex flex-row gap-3">
            <RouterLink :to="`/profile/${post.author}`">
              <Username :userAddress="post.author" />
            </RouterLink>
            <PrettyTimestamp :timestamp="new Date(post.timestamp)" />
          </div>
          <PostMoreActions :post="post" />
        </div>
        <PostMessage :message="post.message" />
        <PostActions :post="post" class="mt-4" />
      </div>
    </div>
  </RouterLink>
</template>
