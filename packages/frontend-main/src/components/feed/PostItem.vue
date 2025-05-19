<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import PostActions from '../feed/PostActions.vue';
import PrettyTimestamp from '../feed/PrettyTimestamp.vue';
import UserAvatar from '../users/UserAvatar.vue';
import Username from '../users/Username.vue';

import PostMessage from './PostMessage.vue';

defineProps<{ post: Post }>();

</script>

<template>
  <RouterLink :to="`/post?hash=${post.hash}`" custom v-slot="{ navigate }" class="flex flex-row gap-3 border-b">
    <div class="flex flex-row gap-3 border-b">
      <UserAvatar :userAddress="post.author" />
      <div class="flex flex-col w-full gap-3" @click="navigate">
        <div class="flex flex-row gap-3 pt-2.5">
          <Username :userAddress="post.author" />
          <PrettyTimestamp :timestamp="new Date(post.timestamp)" />
        </div>
        <PostMessage :post="post" />
        <PostActions :post="post"/>
      </div>
    </div>
  </RouterLink>
</template>
