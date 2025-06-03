<script lang="ts" setup>

import type { InfiniteData, UseInfiniteQueryReturnType } from '@tanstack/vue-query';
import type { Post } from 'api-main/types/feed';

import { computed } from 'vue';
import { Loader } from 'lucide-vue-next';

import Button from '../ui/button/Button.vue';

import PostItem from './PostItem.vue';

import { cn } from '@/utility';

type PostsInfiniteQueryReturnType = UseInfiniteQueryReturnType<InfiniteData<Post[], unknown>, Error>;
const props = defineProps<{ query: PostsInfiniteQueryReturnType }>();
const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = props.query;
const flatPosts = computed(() => data.value?.pages.flat() ?? []);
</script>

<template>
  <div :class="cn('flex flex-col w-full', flatPosts.length && 'border-t')">
    <Loader v-if="isLoading" class="animate-spin w-full mt-10" />

    <span v-else-if="!flatPosts.length" class="self-center mt-4 text-md font-semibold text-base">{{
      $t('components.PostsList.empty') }}</span>

    <PostItem v-else v-for="(post, index) in flatPosts" :key="index" :post="post" class="p-4" />

    <div v-if="isFetchingNextPage || hasNextPage" class="flex items-center justify-center my-4 px-4 h-[40px]">
      <Loader v-if="isFetchingNextPage" class="animate-spin " />
      <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" size="sm" class="w-full text-sm"
              variant="outline">
        {{ $t('components.Button.showMore') }}
      </Button>
    </div>
  </div>
</template>
