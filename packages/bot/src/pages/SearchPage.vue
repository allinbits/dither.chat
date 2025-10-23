<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSearch } from '~/composables/useDitherAPI';
import PostCard from '~/components/PostCard.vue';
import AppPage from '~/components/AppPage.vue';
import { Input, Button } from '~/components/ui';
import { SearchIcon, XIcon, AlertCircleIcon } from 'lucide-vue-next';

const router = useRouter();
const { results, loading, error, search, clearResults } = useSearch();

const searchQuery = ref('');
const searchInput = ref<HTMLInputElement>();

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    search(searchQuery.value.trim());
  }
};

const handleClear = () => {
  searchQuery.value = '';
  clearResults();
  searchInput.value?.focus();
};

const handleLike = (hash: string) => {
  console.log('Liked post:', hash);
};

const handleDislike = (hash: string) => {
  console.log('Disliked post:', hash);
};

const handleReply = (hash: string) => {
  router.push({ name: 'post', params: { hash } });
};

const handleViewAuthor = (address: string) => {
  router.push({ name: 'user', params: { address } });
};

const handleViewPost = (hash: string) => {
  router.push({ name: 'post', params: { hash } });
};

// Auto-search when query changes (with debounce)
let searchTimeout: number;
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout);
  if (newQuery.trim()) {
    searchTimeout = window.setTimeout(() => {
      search(newQuery.trim());
    }, 500);
  } else {
    clearResults();
  }
});
</script>

<template>
  <AppPage title="Search Posts" :back="true">
    <template #title>
      <div class="flex items-center gap-2">
        <SearchIcon class="w-5 h-5" />
        Search Posts
      </div>
    </template>
    <div class="w-full">
      <!-- Search Input -->
      <div class="relative mb-5">
        <Input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Search posts, users, or content..."
          class="w-full pr-20"
          @keyup.enter="handleSearch"
        />
        <Button 
          v-if="searchQuery"
          variant="ghost"
          size="icon"
          class="absolute right-12 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          @click="handleClear"
        >
          <XIcon class="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost"
          size="icon"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
          @click="handleSearch"
          :disabled="!searchQuery.trim() || loading"
        >
          <SearchIcon class="w-4 h-4" />
        </Button>
      </div>

      <!-- Error State -->
      <div v-if="error" class="text-center p-5 bg-red-50 border border-red-200 rounded-lg mb-4">
        <div class="flex items-center justify-center gap-2 mb-3">
          <AlertCircleIcon class="w-4 h-4 text-red-500" />
          <p class="text-red-700">{{ error }}</p>
        </div>
        <Button 
          @click="handleSearch" 
          variant="destructive"
          size="sm"
        >
          Try Again
        </Button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-10 text-gray-500">
        <p>Searching...</p>
      </div>

      <!-- Results -->
      <div v-else-if="results" class="w-full">
        <div class="mb-4 pb-3 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Search Results for "{{ results.query }}"</h3>
          <p class="text-sm text-gray-500">{{ results.total }} posts found</p>
        </div>

        <div v-if="results.posts.length === 0" class="text-center py-10 text-gray-500">
          <p class="mb-2">No posts found for "{{ results.query }}"</p>
          <p class="text-sm">Try different keywords or check your spelling.</p>
        </div>

        <div v-else class="space-y-3">
          <PostCard
            v-for="post in results.posts"
            :key="post.hash"
            :post="post"
            @like="handleLike"
            @dislike="handleDislike"
            @reply="handleReply"
            @view-author="handleViewAuthor"
            @view-post="handleViewPost"
          />
        </div>
      </div>

      <!-- Placeholder -->
      <div v-else class="text-center py-10 text-gray-500">
        <p class="mb-5">Enter a search term to find posts</p>
        <div class="mt-5">
          <h4 class="text-base font-medium text-gray-900 mb-3">Popular searches:</h4>
          <div class="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="default"
              size="sm"
              class="rounded-full"
              @click="searchQuery = 'blockchain'"
            >
              blockchain
            </Button>
            <Button 
              variant="default"
              size="sm"
              class="rounded-full"
              @click="searchQuery = 'defi'"
            >
              defi
            </Button>
            <Button 
              variant="default"
              size="sm"
              class="rounded-full"
              @click="searchQuery = 'cosmos'"
            >
              cosmos
            </Button>
            <Button 
              variant="default"
              size="sm"
              class="rounded-full"
              @click="searchQuery = 'dither'"
            >
              dither
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AppPage>
</template>

