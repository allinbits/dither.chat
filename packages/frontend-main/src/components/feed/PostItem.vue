<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import PostActions from '../feed/PostActions.vue';
import PrettyTimestamp from '../feed/PrettyTimestamp.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

defineProps<{ post: Post }>();

</script>

<template >
  <UserAvatarUsername :userAddress="post.author" />
  <span class="pl-13 leading-6 text-sm">
    {{ post.message }}
  </span>
  <span>
    by {{ post.author }}
  </span>
  <PrettyTimestamp :timestamp="post.timestamp"/>
  <PostActions :post="post" :onClickLike="() => {}" :onClickDislike="() => {}" :onClickComment="() => {}"/>
</template>
