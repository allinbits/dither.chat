<script setup lang="ts">
import { computed } from 'vue';

import Popover from '@/components/ui/popover/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import { useLinkPreview } from '@/composables/useLinkPreview';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  url: string;
  open?: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'mouseenter': [];
  'mouseleave': [];
}>();

const urlRef = computed(() => props.url);
const { data: preview, isLoading, isError } = useLinkPreview({ url: urlRef });

const hasPreview = computed(() => {
  return preview.value && !isError.value && (preview.value.title || preview.value.description || preview.value.image);
});

const isOpen = computed({
  get: () => props.open ?? false,
  set: value => emit('update:open', value),
});

const hostname = computed(() => {
  try {
    return preview.value?.url ? new URL(preview.value.url).hostname : '';
  } catch {
    return '';
  }
});
</script>

<template>
  <Popover v-if="hasPreview" v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverContent
      class="w-80 p-0 max-h-[400px] overflow-hidden"
      side="top"
      :side-offset="8"
      align="start"
      @mouseenter="emit('mouseenter')"
      @mouseleave="emit('mouseleave')"
    >
      <div v-if="isLoading" class="p-4">
        <div class="flex items-center gap-2">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span class="text-sm text-muted-foreground">Loading preview...</span>
        </div>
      </div>
      <div v-else-if="preview && hasPreview" class="flex flex-col cursor-pointer" @click.stop>
        <div v-if="preview.image" class="relative w-full overflow-hidden bg-muted">
          <img
            :src="preview.image"
            :alt="preview.title || 'Preview image'"
            class="h-48 w-full object-cover"
            referrerpolicy="no-referrer"
            @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; }"
          >
        </div>
        <div class="flex flex-col gap-1.5 p-3">
          <h3 v-if="preview.title" class="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
            {{ preview.title }}
          </h3>
          <p v-if="preview.description" class="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {{ preview.description }}
          </p>
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            <span v-if="preview.siteName" class="font-medium truncate">{{ preview.siteName }}</span>
            <span v-if="preview.siteName && preview.url" class="text-muted-foreground/50">·</span>
            <span v-if="preview.url" class="truncate">{{ hostname }}</span>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
  <span v-else>
    <slot />
  </span>
</template>
