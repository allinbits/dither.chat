<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useFetchPost } from '@/composables/useFetchPost';

import MainLayout from '@/layouts/MainLayout.vue';

const route = useRoute();
const loading = ref(false);

const { post, error, loadPost } = useFetchPost();

watch(
    () => ({ hash: route.query.hash, postHash: route.query.postHash }),
    async (newQuery) => {
        const hash = typeof newQuery.hash === 'string' ? newQuery.hash : undefined;
        const postHash = typeof newQuery.postHash === 'string' ? newQuery.postHash : undefined;

        if (!hash) return;

        loading.value = true;
        error.value = '';
        post.value = null;

        await loadPost({ hash, postHash });

        loading.value = false;
    },
    { immediate: true },
);

</script>

<template>
  <MainLayout>
    <div class="post">
      <div
        v-if="loading"
        class="loading"
      >
        Loading...
      </div>

      <div
        v-if="error"
        class="error"
      >
        {{ error }}
      </div>

      <div
        v-if="post"
        class="content"
      >
        <span>{{ post.message }}</span>
      <!-- <p>{{ post.body }}</p> -->
      </div>
    </div>
  </MainLayout>
</template>
