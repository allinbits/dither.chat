<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

import LinkPreviewCard from '@/components/ui/link-preview/LinkPreviewCard.vue';

const props = defineProps<{
  href: string;
  class?: string;
}>();

const isHovered = ref(false);
const hoverTimeout = ref<number | null>(null);
const shouldShowPreview = ref(false);

function handleMouseEnter() {
  // Clear any existing timeout
  if (hoverTimeout.value !== null) {
    clearTimeout(hoverTimeout.value);
  }

  isHovered.value = true;

  // Delay showing preview by 500ms
  hoverTimeout.value = window.setTimeout(() => {
    if (isHovered.value) {
      shouldShowPreview.value = true;
    }
  }, 500);
}

function handleMouseLeave() {
  isHovered.value = false;
  shouldShowPreview.value = false;

  if (hoverTimeout.value !== null) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }
}

function handleClick() {
  // On mobile, show preview on tap (but don't prevent link navigation)
  if (window.innerWidth <= 640) {
    shouldShowPreview.value = !shouldShowPreview.value;
  }
}

onUnmounted(() => {
  if (hoverTimeout.value !== null) {
    clearTimeout(hoverTimeout.value);
  }
});
</script>

<template>
  <LinkPreviewCard v-model:open="shouldShowPreview" :url="href">
    <a
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
      :class="props.class"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <slot />
    </a>
  </LinkPreviewCard>
</template>
