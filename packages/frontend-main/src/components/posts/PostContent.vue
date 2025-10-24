<script lang="ts" setup>
import { computed, ref } from 'vue';

import Button from '@/components/ui/button/Button.vue';

import PostMessage from './PostMessage.vue';

const props = defineProps<{ message: string }>();
const isEmbedToggled = ref(false);

function extractImageURL(msg: string) {
  const regex = /(https?:\/\/\S+\.(?:jpg|jpeg|png|gif))/i;
  const match = msg.match(regex);

  if (match && match[1]) {
    return match[1];
  }
  return null;
}

const hasImage = computed(() => {
  return extractImageURL(props.message) !== null;
});

const imageUrl = computed(() => {
  return extractImageURL(props.message) ?? '';
});

const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/g;
const youtubeLink = computed(() => {
  const regex = youtubeRegex.exec(props.message);
  if (!regex || !regex[1]) {
    return undefined;
  }

  return `https://www.youtube.com/embed/${regex[1]}`;
});
</script>

<template>
  <div class="flex flex-col w-full gap-2">
    <PostMessage :message="props.message" />

    <div v-if="hasImage" class="flex flex-col gap-2 cursor-default" @click.stop="() => {}">
      <Button v-if="!isEmbedToggled" class="w-full text-sm" size="xs" variant="outline" @click.stop="isEmbedToggled = true">
        {{ $t('components.Button.showImage') }}
      </Button>
      <template v-else>
        <Button class="w-full text-sm" size="xs" variant="outline" @click.stop="isEmbedToggled = false">
          {{ $t('components.Button.hideImage') }}
        </Button>
        <div class="flex flex-col">
          <img alt="embedded content" class="rounded" :src="imageUrl">
        </div>
      </template>
    </div>

    <iframe
      v-if="youtubeLink"
      class="w-full aspect-video rounded-sm"
      :src="youtubeLink"
      title="YouTube Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>
