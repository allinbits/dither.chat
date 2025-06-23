<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { CircleX, Loader } from 'lucide-vue-next';

import { useSearchPosts } from '@/composables/useSearchPosts';

import Input from '../input/Input.vue';

import PostMessage from '@/components/posts/PostMessage.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';

const router = useRouter();

const clearSearch = () => {
    query.value = '';
    posts.value = [];
};

const { query, posts, isLoading, error } = useSearchPosts();

const gotoExplore = () => {
    router.push({ name: 'Explore', query: { q: query.value } });
};

</script>

<template>
  <div class="relative">
    <div class="flex items-center gap-2 relative z-10">
      <Input @keyup.enter="gotoExplore" v-model="query" :placeholder="$t('placeholders.search')"/>

      <CircleX
        v-if="query"
        @click="clearSearch"
        class="size-6 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
      />
    </div>

    <div v-if="isLoading || error || query && posts?.length === 0 || posts?.length && posts?.length > 0"
         class="absolute w-full bg-background border-x border-b rounded-b-xs overflow-y-auto overflow-x-hidden shadow">
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

      <div v-else-if="posts?.length && posts?.length > 0"
      >
        <RouterLink
          v-for="(post, index) in posts"
          :key="index"
          :to="`/post/${post.hash}`"
          @click="clearSearch"
          class="p-3 not-last:border-b cursor-pointer flex flex-col gap-1 hover:bg-accent/30 active:bg-accent/30"
        >
          <PostMessage :message="post.message" class="line-clamp-2"/>
          <UserAvatarUsername :userAddress="post.author" size="sm" />
        </RouterLink>
      </div>
    </div>

  </div>
</template>
