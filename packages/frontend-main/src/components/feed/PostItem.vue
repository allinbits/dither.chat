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
  <div class="flex flex-row gap-3 border-b">
    <UserAvatar :userAddress="post.author" />
    <div class="flex flex-col w-full gap-3">
      <div class="flex flex-row gap-3 pt-2.5">
        <Username :userAddress="post.author" />
        <PrettyTimestamp :timestamp="new Date(post.timestamp)" />
      </div>
      <PostMessage :post="post"/>
      <PostActions :post="post" :onClickLike="() => { }" :onClickDislike="() => { }" :onClickComment="() => { }" />
    </div>
  </div>
</template>
