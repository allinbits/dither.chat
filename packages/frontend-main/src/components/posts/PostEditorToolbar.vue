<script lang="ts" setup>
import { CircleAlert, Image, Video } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { extractImageUrl, extractVideoURL, isValidImageURL as validateImageURL, isValidVideoURL as validateVideoURL } from '@/utility/mediaUrls';

const props = defineProps<{
  content?: string;
}>();

const emit = defineEmits<{
  insertText: [text: string];
}>();
const imageUrl = ref('');
const videoUrl = ref('');
const isImagePopoverOpen = ref(false);
const isVideoPopoverOpen = ref(false);

const isValidImageUrl = computed(() => validateImageURL(imageUrl.value));
const isValidVideoUrl = computed(() => validateVideoURL(videoUrl.value));
const showImageError = computed(() => imageUrl.value && !isValidImageUrl.value);
const showVideoError = computed(() => videoUrl.value && !isValidVideoUrl.value);

const hasImageInContent = computed(() => {
  if (!props.content) return false;
  return extractImageUrl(props.content) !== null;
});

const hasVideoInContent = computed(() => {
  if (!props.content) return false;
  return extractVideoURL(props.content) !== null;
});

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
          <Alert v-if="showImageError" variant="destructive">
            <CircleAlert />
            <AlertDescription>
              {{ $t('components.PostEditorToolbar.insertImageError') }}
            </AlertDescription>
          </Alert>
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
          <Alert v-if="showVideoError" variant="destructive">
            <CircleAlert />
            <AlertDescription>
              {{ $t('components.PostEditorToolbar.insertVideoError') }}
            </AlertDescription>
          </Alert>
          <Button :disabled="!isValidVideoUrl" @click="insertVideoUrl">
            {{ $t('components.PostEditorToolbar.insertButton') }}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
