<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { CircleX, Loader } from 'lucide-vue-next';

import { useSearchPosts } from '@/composables/useSearchPosts';

import Input from '../input/Input.vue';

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
  <div>
    <div class="search-input flex items-center gap-2 relative">
      <Input @keyup.enter="gotoExplore" class="w-full h-[40px] rounded-xs" v-model="query" :placeholder="$t('placeholders.search')"/>

      <CircleX
        v-if="query"
        @click="clearSearch"
        class="size-6 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
      />
    </div>

    <div v-if="isLoading" class="flex items-center justify-center mt-2 mb-2">
      <Loader class="animate-spin" />
    </div>

    <div v-else-if="error" class="flex items-center justify-center mt-2 mb-2">
      <p class="text-red-500">
        {{ error.message }}
      </p>
    </div>

    <div v-else-if="query && posts?.length === 0" class="flex items-center justify-center mt-2 mb-2">
      <p class="text-neutral-500">
        {{ $t('components.SearchInput.noResults') }}
      </p>
    </div>

    <div v-else-if="posts?.length && posts?.length > 0"
         class="search-results border-neutral-200 bg-background border-1 max-h-[60vh] pl-2 pr-2 rounded-b-md overflow-y-auto overflow-x-hidden"
    >
      <RouterLink
        v-for="(post, index) in posts"
        :key="index"
        :to="`/post/${post.hash}`"
        class="pt-3 pb-2 border-b border-neutral-200 last:border-b-0 cursor-pointer flex flex-col gap-1"
      >
        <span class="truncate ">{{ post.message }}</span>
        <UserAvatarUsername :userAddress="post.author" size="sm" />
      </RouterLink>
    </div>

  </div>
</template>
