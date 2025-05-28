<script lang="ts" setup>

import type { Post } from 'api-main/types/feed';

defineProps<{ post: Post }>();

</script>

<template>
  <span class="leading-6 text-sm break-all">
    {{ post.message }}
  </span>
</template>
