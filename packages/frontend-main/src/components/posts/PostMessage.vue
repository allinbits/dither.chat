<script lang="ts" setup>
import { computed } from 'vue';
import DOMPurify from 'dompurify';

import { purifyHtml } from '@/utility/sanitize';

const props = defineProps<{ message: string }>();

const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;

const parsedMessage = computed(() => {
    const rawHtml = props.message.replace(
        youtubeRegex,
        (_, videoId) => `
        <iframe
          class="w-full aspect-video rounded-sm"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
    `,
    );
    console.log('DOMPurify.sanitize(rawHtml)DOMPurify.sanitize(rawHtml)', DOMPurify.sanitize(rawHtml));
    return purifyHtml(rawHtml);
});
</script>

<template>
  <div
    class="leading-6 text-sm"
    v-html="parsedMessage"
  />
</template>
