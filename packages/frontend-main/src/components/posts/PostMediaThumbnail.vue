<script lang="ts" setup>
import { CircleAlert, X } from 'lucide-vue-next';
import { computed } from 'vue';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  extractAllImageURLs,
  extractImageUrl,
} from '@/utility/mediaUrls';

const props = defineProps<{
  content?: string;
}>();

const emit = defineEmits<{
  removeText: [text: string];
}>();

const imageUrls = computed(() => {
  if (!props.content) return { valids: [], invalids: [] };
  return extractAllImageURLs(props.content);
});

// Validate content and return error message key if there are issues
const validationError = computed(() => {
  if (!props.content) return null;

  const { valids, invalids } = imageUrls.value;
  const totalImages = valids.length + invalids.length;

  if (totalImages === 0) return null;

  const hasMultipleImages = totalImages > 1;
  if (hasMultipleImages) {
    return 'components.PostMediaThumbnail.multipleImagesWarning';
  }

  // If there's an invalid URL, return the appropriate error based on the reason
  if (invalids.length > 0) {
    const { reason } = invalids[0];

    if (reason === 'UNTRUSTED_DOMAIN') {
      return 'components.PostMediaThumbnail.untrustedDomainWarning';
    }

    if (reason === 'INVALID_EXTENSION') {
      return 'components.PostMediaThumbnail.invalidFormatWarning';
    }
  }

  return null;
});

// Get thumbnail URL only if valid and no validation errors
const thumbnailUrl = computed(() => {
  if (!props.content || validationError.value !== null) return null;
  return extractImageUrl(props.content);
});

function handleRemove() {
  if (thumbnailUrl.value) {
    emit('removeText', thumbnailUrl.value);
  }
}
</script>

<template>
  <div v-if="thumbnailUrl || validationError" class="flex flex-col gap-2">
    <!-- Image Thumbnail Preview -->
    <div v-if="thumbnailUrl" class="relative w-fit border rounded-sm overflow-hidden">
      <img
        :src="thumbnailUrl"
        alt="Image preview"
        class="max-h-20 object-contain"
        referrerpolicy="no-referrer"
      >
      <button
        type="button"
        class="absolute top-1 right-1 bg-background/80 hover:bg-background rounded-full p-1"
        @click="handleRemove"
      >
        <X class="size-3" />
      </button>
    </div>

    <!-- Validation Warning -->
    <Alert v-if="validationError" variant="warning">
      <CircleAlert />
      <AlertDescription>
        {{ $t(validationError) }}
      </AlertDescription>
    </Alert>
  </div>
</template>
