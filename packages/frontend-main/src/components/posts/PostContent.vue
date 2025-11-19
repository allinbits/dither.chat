<script lang="ts" setup>
import { computed, ref } from 'vue';

import Button from '@/components/ui/button/Button.vue';
import { extractImageUrl, extractVideoURL } from '@/utility/mediaUrls';

import PostMessage from './PostMessage.vue';

const props = defineProps<{ message: string }>();
const isEmbedToggled = ref(false);

const imageUrl = computed(() => extractImageUrl(props.message) || '');
const hasImage = computed(() => imageUrl.value.length > 0);

const youtubeLink = computed(() => {
  return extractVideoURL(props.message);
});
</script>

<template>
  <div class="flex flex-col w-full gap-2 max-w-[calc(min(100dvw,var(--main-min-width-desktop))-5.5rem)]">
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
          <img alt="embedded content" class="rounded" :src="imageUrl" referrerpolicy="no-referrer">
        </div>
      </template>
    </div>

    <iframe
      v-if="youtubeLink"
      class="w-full aspect-video rounded-sm max-w-[calc(100%-0.5rem)]"
      :src="youtubeLink"
      title="YouTube Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>
