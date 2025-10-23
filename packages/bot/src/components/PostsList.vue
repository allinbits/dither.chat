<script lang="ts" setup>
import type { InfiniteData, UseInfiniteQueryReturnType } from '@tanstack/vue-query';
import type { Post } from '~/composables/useDitherAPI';
import { computed } from 'vue';
import { Loader } from 'lucide-vue-next';
import Button from '~/components/ui/button/Button.vue';
import PostCard from './PostCard.vue';
import { cn } from '~/lib/utils';

type PostsInfiniteQueryReturnType = UseInfiniteQueryReturnType<InfiniteData<Post[], unknown>, Error>;
const props = defineProps<{ query: PostsInfiniteQueryReturnType; emptyText?: string }>();

const emit = defineEmits<{
  like: [hash: string];
  dislike: [hash: string];
  reply: [hash: string];
  viewAuthor: [address: string];
  viewPost: [hash: string];
}>();

const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = props.query;
const flatPosts = computed(() => data.value?.pages.flat() ?? []);

const handleLike = (hash: string) => {
  emit('like', hash);
};

const handleDislike = (hash: string) => {
  emit('dislike', hash);
};

const handleReply = (hash: string) => {
  emit('reply', hash);
};

const handleViewAuthor = (address: string) => {
  emit('viewAuthor', address);
};

const handleViewPost = (hash: string) => {
  emit('viewPost', hash);
};
</script>

<template>
  <div :class="cn('flex flex-col w-full box-border', flatPosts.length && 'border-t')">
    <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

    <span v-else-if="!flatPosts.length" class="self-center mt-4 text-md font-semibold text-base">{{
      emptyText || 'No posts found. Be the first to post!' }}</span>

    <PostCard 
      v-else 
      v-for="post in flatPosts" 
      :key="post.hash" 
      :post="post" 
      class="flex flex-wrap w-full break-words" 
      @like="handleLike"
      @dislike="handleDislike"
      @reply="handleReply"
      @view-author="handleViewAuthor"
      @view-post="handleViewPost"
    />

    <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center my-4 px-4 h-[40px]">
      <Loader v-if="isFetchingNextPage" class="animate-spin" />
      <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" size="sm" class="w-full text-sm"
              variant="outline">
        Show More
      </Button>
    </div>
  </div>
</template>
