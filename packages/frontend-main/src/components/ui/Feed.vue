<script lang="ts" setup>

import { useFeed } from '@/composables/useFeed';

const { data } = useFeed();

</script>

<template>
  <div class="flex flex-col gap-4">

    <div v-for="(post, index) in data" :key="index" class="flex flex-col border-b py-4">
      <span>
        {{ post.message }}
      </span>
      <span>
        by {{ post.author }}
      </span>
    </div>
  </div>
</template>
