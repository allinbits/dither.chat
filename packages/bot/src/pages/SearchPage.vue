<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSearch } from '~/composables/useDitherAPI';
import PostCard from '~/components/PostCard.vue';
import AppPage from '~/components/AppPage.vue';

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
  <AppPage title="🔍 Search Posts" :back="true">
    <div class="search-page">
      <div class="search-page__input-container">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Search posts, users, or content..."
          class="search-page__input"
          @keyup.enter="handleSearch"
        />
        <button 
          v-if="searchQuery"
          class="search-page__clear"
          @click="handleClear"
        >
          ✕
        </button>
        <button 
          class="search-page__search"
          @click="handleSearch"
          :disabled="!searchQuery.trim() || loading"
        >
          🔍
        </button>
      </div>

      <div v-if="error" class="search-page__error">
        <p>❌ {{ error }}</p>
        <button @click="handleSearch" class="search-page__retry">
          Try Again
        </button>
      </div>

      <div v-else-if="loading" class="search-page__loading">
        <p>Searching...</p>
      </div>

      <div v-else-if="results" class="search-page__results">
        <div class="search-page__results-header">
          <h3>Search Results for "{{ results.query }}"</h3>
          <p>{{ results.total }} posts found</p>
        </div>

        <div v-if="results.posts.length === 0" class="search-page__no-results">
          <p>No posts found for "{{ results.query }}"</p>
          <p>Try different keywords or check your spelling.</p>
        </div>

        <div v-else class="search-page__posts">
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

      <div v-else class="search-page__placeholder">
        <p>Enter a search term to find posts</p>
        <div class="search-page__suggestions">
          <h4>Popular searches:</h4>
          <div class="search-page__suggestion-tags">
            <button 
              class="search-page__suggestion-tag"
              @click="searchQuery = 'blockchain'"
            >
              blockchain
            </button>
            <button 
              class="search-page__suggestion-tag"
              @click="searchQuery = 'defi'"
            >
              defi
            </button>
            <button 
              class="search-page__suggestion-tag"
              @click="searchQuery = 'cosmos'"
            >
              cosmos
            </button>
            <button 
              class="search-page__suggestion-tag"
              @click="searchQuery = 'dither'"
            >
              dither
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppPage>
</template>

<style scoped>
.search-page {
  max-width: 100%;
}

.search-page__input-container {
  position: relative;
  margin-bottom: 20px;
}

.search-page__input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid var(--tg-theme-hint-color, #e0e0e0);
  border-radius: 8px;
  font-size: 16px;
  background: var(--tg-theme-bg-color, #ffffff);
  color: var(--tg-theme-text-color, #000000);
  box-sizing: border-box;
}

.search-page__input:focus {
  outline: none;
  border-color: var(--tg-theme-button-color, #007aff);
}

.search-page__clear,
.search-page__search {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.search-page__clear {
  right: 40px;
  color: var(--tg-theme-hint-color, #666666);
}

.search-page__search {
  right: 8px;
  color: var(--tg-theme-button-color, #007aff);
}

.search-page__search:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-page__error {
  text-align: center;
  padding: 20px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  margin-bottom: 16px;
}

.search-page__error p {
  margin: 0 0 12px 0;
  color: #d32f2f;
}

.search-page__retry {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.search-page__loading {
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-theme-hint-color, #666666);
}

.search-page__results-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #e0e0e0);
}

.search-page__results-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: var(--tg-theme-text-color, #000000);
}

.search-page__results-header p {
  margin: 0;
  font-size: 14px;
  color: var(--tg-theme-hint-color, #666666);
}

.search-page__no-results {
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-theme-hint-color, #666666);
}

.search-page__placeholder {
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-theme-hint-color, #666666);
}

.search-page__suggestions {
  margin-top: 20px;
}

.search-page__suggestions h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--tg-theme-text-color, #000000);
}

.search-page__suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.search-page__suggestion-tag {
  background: var(--tg-theme-button-color, #007aff);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.search-page__suggestion-tag:hover {
  opacity: 0.8;
}
</style>
