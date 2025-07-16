<script lang="ts" setup>
import { computed, ref } from 'vue';

import PostMessage from './PostMessage.vue';

import Button from '@/components/ui/button/Button.vue';

const props = defineProps<{ message: string }>();
const isEmbedToggled = ref(false);

function extractImageURL(msg: string) {
    const regex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif))/i;
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

const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
const youtubeLink = computed(() => {
    const regex = youtubeRegex.exec(props.message);
    if (!regex || !regex[0]) {
        return undefined;
    }

    return regex[0].replace('watch?v=', 'embed/');
});
</script>

<template>
  <div class="flex flex-col w-full gap-2">
    <PostMessage :message="props.message" />

    <div v-if="hasImage" class="flex flex-col gap-2 cursor-default" @click.stop="() => {}">
      <Button class="w-full text-sm" @click.stop="isEmbedToggled = true" v-if="!isEmbedToggled" size="xs" variant="outline">
        {{ $t('components.Button.showImage') }}
      </Button>
      <template v-else>
        <Button class="w-full text-sm" @click.stop="isEmbedToggled = false" size="xs" variant="outline">
          {{ $t('components.Button.hideImage') }}
        </Button>
        <div class="flex flex-col">
          <img  alt="embedded content" class="rounded" :src="imageUrl" />
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
    ></iframe>
  </div>
</template>
