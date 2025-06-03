<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';

import Button from '@/components/ui/button/Button.vue';

const props = defineProps<{ post: Post }>();
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
    return extractImageURL(props.post.message) !== null;
});

const imageUrl = computed(() => {
    return extractImageURL(props.post.message) ?? '';
});
</script>

<template>
  <div class="flex flex-col w-full gap-2">
    <span class="leading-6 text-sm break-all">
      {{ post.message }}
    </span>
    <div v-if="hasImage" class="flex flex-col gap-2 cursor-default" @click.stop="() => {}">
      <Button class="w-full text-sm" @click.stop="isEmbedToggled = true" v-if="!isEmbedToggled" size="xs" variant="ghost">
        {{ $t('components.Button.showImage') }}
      </Button>
      <template v-else>
        <Button class="w-full text-sm" @click.stop="isEmbedToggled = false" size="xs" variant="ghost">
          {{ $t('components.Button.hideImage') }}
        </Button>
        <div class="flex flex-col">
          <img  alt="embedded content" class="rounded" :src="imageUrl" />
        </div>
      </template>
    </div>
  </div>
</template>
