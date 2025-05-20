<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Loader } from 'lucide-vue-next';

import { usePost } from '@/composables/usePost';

import PostActions from '@/components/feed/PostActions.vue';
import PostMessage from '@/components/feed/PostMessage.vue';
import PrettyTimestamp from '@/components/feed/PrettyTimestamp.vue';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const route = useRoute();
const hash = typeof route.query.hash === 'string' ? route.query.hash : '';
const postHash = typeof route.query.postHash === 'string' ? route.query.postHash : undefined;
const { data: post, isLoading, isError, error } = usePost({
    hash, postHash,
});

</script>

<template>
  <MainLayout>
    <div v-if="isLoading || isError" class="w-full mt-10 flex justify-center">
      <Loader v-if="isLoading" class="animate-spin" />
      <span v-else-if="isError && error" class="text-center text-red-500">{{ error.message }}</span>
    </div>

    <div v-if="post" class="flex flex-col p-4 w-full">
      <RouterLink :to="`/profile?address=${post.author}`">
        <div class="flex flex-row gap-3 mb-2">
          <UserAvatarUsername :userAddress="post.author" />
          <PrettyTimestamp :timestamp="new Date(post.timestamp)" />
        </div>
      </RouterLink>
      <PostMessage :post="post" />
      <div class="py-2 mt-4 border-y">
        <PostActions :post="post" class="px-2" />
      </div>
    </div>
  </MainLayout>
</template>
