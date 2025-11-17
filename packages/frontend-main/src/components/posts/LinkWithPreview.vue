<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

import LinkPreviewCard from '@/components/ui/link-preview/LinkPreviewCard.vue';

const props = defineProps<{
  href: string;
  class?: string;
}>();

const isHovered = ref(false);
const hoverTimeout = ref<number | null>(null);
const hideTimeout = ref<number | null>(null);
const shouldShowPreview = ref(false);

function handleMouseEnter() {
  // Clear any hide timeout
  if (hideTimeout.value !== null) {
    clearTimeout(hideTimeout.value);
    hideTimeout.value = null;
  }

  // Clear any existing show timeout
  if (hoverTimeout.value !== null) {
    clearTimeout(hoverTimeout.value);
  }

  isHovered.value = true;

  // Delay showing preview by 400ms (similar to X.com/Bluesky)
  hoverTimeout.value = window.setTimeout(() => {
    if (isHovered.value) {
      shouldShowPreview.value = true;
    }
  }, 400);
}

function handleMouseLeave() {
  isHovered.value = false;

  // Clear show timeout
  if (hoverTimeout.value !== null) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }

  // Small delay before hiding to allow moving to preview card (like X.com/Bluesky)
  hideTimeout.value = window.setTimeout(() => {
    if (!isHovered.value && !shouldShowPreview.value) {
      shouldShowPreview.value = false;
    }
  }, 150);
}

function handlePreviewMouseEnter() {
  // Keep preview open when hovering over it
  if (hideTimeout.value !== null) {
    clearTimeout(hideTimeout.value);
    hideTimeout.value = null;
  }
  shouldShowPreview.value = true;
}

function handlePreviewMouseLeave() {
  // Hide preview when leaving the preview card
  shouldShowPreview.value = false;
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
  if (hideTimeout.value !== null) {
    clearTimeout(hideTimeout.value);
  }
});
</script>

<template>
  <LinkPreviewCard
    v-model:open="shouldShowPreview"
    :url="href"
    @mouseenter="handlePreviewMouseEnter"
    @mouseleave="handlePreviewMouseLeave"
  >
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
