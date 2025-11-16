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
</script>

<template>
  <Popover v-if="hasPreview" v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0" side="top" :side-offset="8">
      <div v-if="isLoading" class="p-4">
        <div class="flex items-center gap-2">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span class="text-sm text-muted-foreground">Loading preview...</span>
        </div>
      </div>
      <div v-else-if="preview && hasPreview" class="flex flex-col">
        <img
          v-if="preview.image"
          :src="preview.image"
          :alt="preview.title || 'Preview image'"
          class="h-48 w-full object-cover rounded-t-md"
          referrerpolicy="no-referrer"
          @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; }"
        >
        <div class="flex flex-col gap-2 p-4">
          <h3 v-if="preview.title" class="font-semibold text-sm line-clamp-2">
            {{ preview.title }}
          </h3>
          <p v-if="preview.description" class="text-xs text-muted-foreground line-clamp-3">
            {{ preview.description }}
          </p>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span v-if="preview.siteName" class="font-medium">{{ preview.siteName }}</span>
            <span v-if="preview.siteName && preview.url" class="text-muted-foreground/60">•</span>
            <span v-if="preview.url" class="truncate">{{ new URL(preview.url).hostname }}</span>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
  <span v-else>
    <slot />
  </span>
</template>
