<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useFetchPost } from '@/composables/useFetchPost';

import PostActions from '@/components/feed/PostActions.vue';
import PostMessage from '@/components/feed/PostMessage.vue';
import PrettyTimestamp from '@/components/feed/PrettyTimestamp.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const route = useRoute();
const loading = ref(false);

const { data: post, error, loadPost } = useFetchPost();

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

    <div v-if="loading" class="loading">Loading...</div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="post" class="flex flex-col pt-4">
      <div class="flex flex-row gap-3 mb-2">
        <UserAvatarUsername :userAddress="post.author" />
        <PrettyTimestamp :timestamp="new Date(post.timestamp)" />
      </div>
      <PostMessage :post="post"/>
      <div class="h-[1px] w-full my-3 bg-neutral-200"/>
      <PostActions :post="post" :onClickLike="() => { }" :onClickDislike="() => { }" :onClickComment="() => { }" />
      <div class="h-[1px] w-full my-3 bg-neutral-200"/>

    </div>
  </MainLayout>
</template>
