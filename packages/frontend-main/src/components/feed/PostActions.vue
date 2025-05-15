<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { MessageCircle, ThumbsDown, ThumbsUp, Upload } from 'lucide-vue-next';

defineProps<{ post: Post; onClickLike: () => void; onClickDislike: () => void; onClickComment: () => void }>();
</script>
<template>
  <div class="flex flex-row items-center justify-between">
    <button class="flex flex-row items-center gap-1" @click="onClickComment">
      <MessageCircle class="size-5" color="#A2A2A9"/>
      <span class="text-[#A2A2A9] text-xs font-medium">{{ post.replies }}</span>
    </button>
    <button class="flex flex-row items-center gap-1" @click="onClickLike">
      <ThumbsUp class="size-5" color="#A2A2A9"/>
      <span class="text-[#A2A2A9] text-xs font-medium">{{ post.likes }}</span>
    </button>
    <button class="flex flex-row items-center gap-1" @click="onClickDislike">
      <ThumbsDown class="size-5 scale-x-[-1]" color="#A2A2A9"/>
      <span class="text-[#A2A2A9] text-xs font-medium">{{ post.dislikes }}</span>
    </button>
    <button>
      <Upload class="size-5" color="#A2A2A9"/>
    </button>
  </div>
</template>
