<script setup lang="ts">
import { CircleX, Loader } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

import PostMessage from '@/components/posts/PostMessage.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import { useSearchPosts } from '@/composables/useSearchPosts';

import Input from '../input/Input.vue';

const { query, posts, isLoading, error } = useSearchPosts();

function clearSearch() {
  query.value = '';
  posts.value = [];
}
</script>

<template>
  <div class="relative">
    <div class="flex items-center gap-2 relative z-10">
      <Input v-model="query" :placeholder="$t('placeholders.search')" />

      <CircleX
        v-if="query"
        class="size-6 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
        @click="clearSearch"
      />
    </div>

    <div
      v-if="isLoading || error || query && posts?.length === 0 || posts?.length && posts?.length > 0"
      class="absolute w-full bg-background border-x border-b rounded-b-xs overflow-y-auto overflow-x-hidden shadow"
    >
      <div v-if="isLoading" class="flex items-center justify-center">
        <Loader class="animate-spin" />
      </div>

      <div v-else-if="error" class="flex items-center justify-center p-3">
        <p class="text-red-500">
          {{ error.message }}
        </p>
      </div>

      <div v-else-if="query && posts?.length === 0" class="flex items-center justify-center p-3">
        <p class="text-neutral-500">
          {{ $t('components.SearchInput.noResults') }}
        </p>
      </div>

      <div v-else-if="posts?.length && posts?.length > 0">
        <RouterLink
          v-for="(post, index) in posts"
          :key="index"
          :to="`/post/${post.hash}`"
          class="p-3 not-last:border-b cursor-pointer flex flex-col gap-1 hover:bg-accent/30 active:bg-accent/30 transition-colors"
          @click="clearSearch"
        >
          <PostMessage :message="post.message" class="line-clamp-2" />
          <UserAvatarUsername :user-address="post.author" size="sm" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>
