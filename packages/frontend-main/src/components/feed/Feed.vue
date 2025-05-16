<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

import { useFeed } from '@/composables/useFeed';
import { type PopoverState, usePopovers } from '@/composables/usePopovers';
import { useWallet } from '@/composables/useWallet';

import PostActions from './PostActions.vue';
import PrettyTimestamp from './PrettyTimestamp.vue';

import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';

const { data } = useFeed();
const wallet = useWallet();

const popovers = usePopovers();

function handleAction(type: keyof PopoverState, post: Post) {
    if (!wallet.loggedIn.value) {
        return;
    }

    popovers.show(type, post);
}
</script>

<template >
  <div class="flex flex-col w-full gap-4 md:border-x border-x-neutral-200 ">

    <div v-for="(post, index) in data" :key="index" class="flex flex-col border-b py-4 px-4">
      <UserAvatarUsername :userAddress="post.author" />
      <span class="pl-13 leading-6 text-sm">
        {{ post.message }}
      </span>
      <span>
        by {{ post.author }}
      </span>
      <PrettyTimestamp :timestamp="new Date(post.timestamp)"/>
      <PostActions :post="post" :onClickLike="handleAction" :onClickDislike="handleAction" :onClickComment="handleAction"/>
    </div>
  </div>
</template>
