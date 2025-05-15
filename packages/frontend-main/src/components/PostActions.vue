<script setup lang="ts">
import type { Post } from 'api-main/types/feed';
import type { PopoverState } from '@/composables/usePopovers';

import { MessageCircle, ThumbsDown, ThumbsUp, Upload } from 'lucide-vue-next';

import { useWallet } from '@/composables/useWallet';

type HandleAction = (type: keyof PopoverState, hash: Post) => void;

defineProps<{ post: Post; onClickLike: HandleAction; onClickDislike: HandleAction; onClickComment: HandleAction }>();

const wallet = useWallet();

function getHoverClasses() {
    return wallet.loggedIn.value ? ['cursor-pointer'] : ['cursor-default'];
}
</script>
<template>
  <div class="flex flex-row items-center justify-between">
    <button class="flex flex-row items-center gap-1" @click="onClickComment('reply', post)">
      <MessageCircle class="size-5" color="#A2A2A9"/>
      <span class="text-[#A2A2A9] text-xs font-medium">{{ post.replies }}</span>
    </button>
    <button class="flex flex-row items-center gap-1" :class="getHoverClasses()"  @click="onClickLike('like', post)">
      <ThumbsUp class="size-5" color="#A2A2A9"/>
      <span class="text-[#A2A2A9] text-xs font-medium">{{ post.likes }}</span>
    </button>
    <button class="flex flex-row items-center gap-1" :class="getHoverClasses()" @click="onClickDislike('dislike', post)">
      <ThumbsDown class="size-5 scale-x-[-1]" color="#A2A2A9"/>
      <span class="text-[#A2A2A9] text-xs font-medium">{{ post.dislikes }}</span>
    </button>
    <button>
      <Upload class="size-5" color="#A2A2A9"/>
    </button>
  </div>
</template>
