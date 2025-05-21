<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import PostMoreActionsPopover from '../popups/PostMoreActionsPopover.vue';
import PostActions from '../posts/PostActions.vue';
import PrettyTimestamp from '../posts/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import PostMessage from './PostMessage.vue';

defineProps<{ post: Post }>();

</script>

<template>
  <RouterLink :to="`/post/${post.hash}`" custom v-slot="{ navigate }">
    <div class="flex flex-row gap-3 border-b cursor-pointer">
      <RouterLink :to="`/profile/${post.author}`" class="size-[40px]">
        <UserAvatar :userAddress="post.author" />
      </RouterLink>

      <div class="flex flex-col w-full gap-3" @click="navigate">
        <div class="flex flex-row justify-between items-center">
          <div class="flex flex-row gap-3 pt-2.5">
            <RouterLink :to="`/profile/${post.author}`">
              <Username :userAddress="post.author" />
            </RouterLink>
            <PrettyTimestamp :timestamp="new Date(post.timestamp)" />
          </div>
          <PostMoreActionsPopover :post="post" />
        </div>

        <PostMessage :post="post" />
        <PostActions :post="post" />
      </div>
    </div>
  </RouterLink>
</template>
