<script setup lang="ts">
import { useRouter } from 'vue-router';
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

const { query, posts, isLoading, error } = useSearchPosts();
const router = useRouter();

const navigateToPost = (hash: string) => {
    router.push(`/post?hash=${hash}`);
};
</script>

<template>
  <div class="w-full max-w-[310px] min-w-[140px]">
    <div class="search-input flex items-center gap-2 relative ">
      <input
        v-model="query"
        :placeholder="props.placeholder"
        class="bg-neutral-200 p-2 h-[40px] flex-1 pr-10 w-full"
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
        {{ $t('components.SearchInput.noResults') }}
      </p>
    </div>

    <div v-else
         class="search-results border-neutral-200 bg-background border-1 max-h-[60vh] pl-2 pr-2 rounded-b-md overflow-y-auto overflow-x-hidden"
    >
      <div
        v-for="(post, index) in posts"
        :key="index"
        class="pb-2 pt-2 border-b border-neutral-200 last:border-b-0 truncate cursor-pointer"
        @click="navigateToPost(post.hash)"
      >
        {{ post.message }}
        <UserAvatarUsername :userAddress="post.author" size="sm" />
      </div>
    </div>

  </div>
</template>
