<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useFetchPost } from '@/composables/useFetchPost';

const route = useRoute();
const loading = ref(false);

const { post, error, loadPost } = useFetchPost();

watch(() => route.params.id, fetchData, { immediate: true });

async function fetchData(id?: string | string[]) {
    loading.value = true;
    error.value = '';
    post.value = null;
    await loadPost(Number(id));

    console.log('===== post.value ', post.value);
    // console.log('===== Number(id) ', Number(id))
    // console.log('===== Number(id) ', route)

    loading.value = false;
}
</script>

<template>
  <div class="post">
    <div v-if="loading" class="loading">Loading...</div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="post" class="content">
      <span>{{ post.message }}</span>
      <!-- <p>{{ post.body }}</p> -->
    </div>
  </div>
</template>
