<script lang="ts" setup>
import type { InfiniteData, UseInfiniteQueryReturnType } from '@tanstack/vue-query';
import type { Post } from 'api-main/types/feed';

import { Frown, Loader } from 'lucide-vue-next';
import { computed } from 'vue';

import Button from '../ui/button/Button.vue';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import PostItem from './PostItem.vue';

type PostsInfiniteQueryReturnType = UseInfiniteQueryReturnType<InfiniteData<Post[], unknown>, Error>;
const props = defineProps<{ query: PostsInfiniteQueryReturnType; emptyText?: string }>();
const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = props.query;
const flatPosts = computed(() => data.value?.pages.flat() ?? []);
</script>

<template>
  <div class="flex flex-col w-full box-border">
    <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

    <Empty v-else-if="!flatPosts.length" class="mt-4">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Frown class="size-6" />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>
        {{ emptyText || $t('components.PostsList.empty') }}
      </EmptyTitle>
    </Empty>

    <PostItem v-for="post in flatPosts" v-else :key="post.hash" :post="post" class="flex flex-wrap w-full break-words" />

    <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center my-4 px-4 h-[40px]">
      <Loader v-if="isFetchingNextPage" class="animate-spin " />
      <Button
        v-if="hasNextPage && !isFetchingNextPage" size="sm" class="w-full text-sm" variant="outline"
        @click="fetchNextPage"
      >
        {{ $t('components.Button.showMore') }}
      </Button>
    </div>
  </div>
</template>
