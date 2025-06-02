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
  <div class="flex flex-col w-full gap-3">
    <span class="leading-6 text-sm break-all">
      {{ post.message }}
    </span>
    <div v-if="hasImage" class="flex flex-col border p-4 gap-3">
      <Button class="w-full" @click.stop="isEmbedToggled = true" v-if="!isEmbedToggled">
        {{ $t('components.Button.show') }}
      </Button>
      <template v-else>
        <Button class="w-full" @click.stop="isEmbedToggled = false">
          {{ $t('components.Button.hide') }}
        </Button>
        <div class="flex flex-col border">
          <img  alt="embedded content" :src="imageUrl" />
        </div>
      </template>
    </div>
  </div>
</template>
