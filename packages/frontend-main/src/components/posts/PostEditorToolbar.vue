<script lang="ts" setup>
import { CircleAlert, Image, Video, X } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { extractImageURL, extractVideoURL, isValidImageURL as validateImageURL, isValidVideoURL as validateVideoURL } from '@/utility/mediaUrls';

const props = defineProps<{
  content?: string;
}>();

const emit = defineEmits<{
  insertText: [text: string];
  removeText: [text: string];
}>();
const imageUrl = ref('');
const videoUrl = ref('');
const isImagePopoverOpen = ref(false);
const isVideoPopoverOpen = ref(false);

const isValidImageUrl = computed(() => validateImageURL(imageUrl.value));
const isValidVideoUrl = computed(() => validateVideoURL(videoUrl.value));
const showImageError = computed(() => imageUrl.value && !isValidImageUrl.value);
const showVideoError = computed(() => videoUrl.value && !isValidVideoUrl.value);

const detectedImageUrl = computed(() => {
  if (!props.content) return null;
  const url = extractImageURL(props.content);
  return url;
});

const hasImageInContent = computed(() => detectedImageUrl.value !== null);

const hasVideoInContent = computed(() => {
  if (!props.content) return false;
  return extractVideoURL(props.content) !== null;
});

function handleRemoveImage() {
  if (detectedImageUrl.value) {
    emit('removeText', detectedImageUrl.value);
  }
}

function insertImageUrl() {
  if (isValidImageUrl.value) {
    emit('insertText', imageUrl.value);
    imageUrl.value = '';
    isImagePopoverOpen.value = false;
  }
}

function insertVideoUrl() {
  if (isValidVideoUrl.value) {
    emit('insertText', videoUrl.value);
    videoUrl.value = '';
    isVideoPopoverOpen.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Image Thumbnail Preview -->
    <div v-if="detectedImageUrl" class="relative w-fit border rounded-sm overflow-hidden">
      <img :src="detectedImageUrl" alt="Image preview" class="max-h-20 object-contain" loading="lazy" referrerpolicy="no-referrer">
      <button
        type="button"
        class="absolute top-1 right-1 bg-background/80 hover:bg-background rounded-full p-1"
        @click="handleRemoveImage"
      >
        <X class="size-3" />
      </button>
    </div>

    <div class="flex gap-2 items-center border-t pt-2">
      <!-- Image URL Popover -->
      <Popover v-model:open="isImagePopoverOpen" modal>
        <PopoverTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            title="Insert image URL"
            :class="{ 'text-blue-500': hasImageInContent }"
          >
            <Image class="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80">
          <div class="flex flex-col gap-2">
            <h4 class="font-medium">
              {{ $t('components.PostEditorToolbar.insertImageTitle') }}
            </h4>
            <Input
              v-model="imageUrl"
              :placeholder="$t('components.PostEditorToolbar.insertImagePlaceholder')"
            />
            <div
              v-if="showImageError"
              data-slot="alert"
              role="alert"
              class="relative rounded-sm w-full border text-xs px-3 py-2 text-destructive-foreground bg-card flex items-start gap-2"
            >
              <CircleAlert class="size-4 translate-y-0.5 flex-shrink-0" />
              <div data-slot="alert-description" class="col-start-2">
                {{ $t('components.PostEditorToolbar.insertImageError') }}
              </div>
            </div>
            <Button :disabled="!isValidImageUrl" @click="insertImageUrl">
              {{ $t('components.PostEditorToolbar.insertButton') }}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- Video URL Popover -->
      <Popover v-model:open="isVideoPopoverOpen" modal>
        <PopoverTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            title="Insert video link"
            :class="{ 'text-primary': hasVideoInContent }"
          >
            <Video class="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80" side="bottom" :side-offset="5">
          <div class="flex flex-col gap-2">
            <h4 class="font-medium">
              {{ $t('components.PostEditorToolbar.insertVideoTitle') }}
            </h4>
            <Input
              v-model="videoUrl"
              :placeholder="$t('components.PostEditorToolbar.insertVideoPlaceholder')"
              @keyup.enter="insertVideoUrl"
            />
            <div
              v-if="showVideoError"
              data-slot="alert"
              role="alert"
              class="relative rounded-sm w-full border text-xs px-3 py-2 text-destructive-foreground bg-card flex items-start gap-2"
            >
              <CircleAlert class="size-4 translate-y-0.5 flex-shrink-0" />
              <div data-slot="alert-description" class="col-start-2">
                {{ $t('components.PostEditorToolbar.insertVideoError') }}
              </div>
            </div>
            <Button :disabled="!isValidVideoUrl" @click="insertVideoUrl">
              {{ $t('components.PostEditorToolbar.insertButton') }}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>
