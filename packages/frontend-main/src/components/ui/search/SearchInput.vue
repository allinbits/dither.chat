<script setup lang="ts">
import { CircleX, Loader2 } from 'lucide-vue-next';

import { useSearchPosts } from '@/composables/useSearchPosts';

import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';

interface SearchInputProps {
    placeholder?: string;
}

const props = withDefaults(
    defineProps<SearchInputProps>(),
    { placeholder: 'Type to search...' },
);

const clearSearch = () => {
    query.value = '';
    posts.value = [];
};

const { query, posts, isLoading, error } = useSearchPosts(3, 300);

</script>

<template>
  <div>
    <div class="flex items-center gap-2 relative">
      <input
        v-model="query"
        :placeholder="props.placeholder"
        class="bg-neutral-200 p-2 h-[44px] flex-1 pr-10"
      />

      <CircleX
        v-if="query"
        @click="clearSearch"
        class="size-6 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
      />
    </div>

    <div v-if="isLoading" class="flex items-center justify-center mt-2 mb-2">
      <Loader2 class="size-4 animate-spin" />
    </div>

    <div v-else-if="error" class="flex items-center justify-center mt-2 mb-2">
      <p class="text-red-500">
        {{ error.message }}
      </p>
    </div>

    <div v-else-if="query && posts?.length === 0" class="flex items-center justify-center mt-2 mb-2">
      <p class="text-neutral-500">
        No results found
      </p>
    </div>

    <div v-else
         class="results-list border-neutral-200 border-1 max-h-[60vh] pl-2 pr-2 rounded-b-md overflow-y-auto overflow-x-hidden"
    >
      <div v-for="(post, index) in posts" :key="index" class="pb-2 pt-2 border-b border-neutral-200 last:border-b-0 truncate">
        {{ post.message }}
        <UserAvatarUsername :userAddress="post.author" size="sm" />
      </div>
    </div>

  </div>
</template>
