<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{ message: string }>();

interface MessageSegment {
    type: 'text' | 'link';
    content: string;
}

function extractGenericLink(msg: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/i;
    const match = msg.match(urlRegex);

    if (match && match[1]) {
        return match[1];
    }
    return null;
}

const parsedMessage = computed((): MessageSegment[] => {
    const message = props.message;
    const link = extractGenericLink(message);
    const segments: MessageSegment[] = [];

    if (!link) {
        segments.push({ type: 'text', content: message });
        return segments;
    }

    const parts = message.split(link, 2);
    const textBefore = parts[0];
    const textAfter = parts.length > 1 ? parts[1] : '';

    if (textBefore.length > 0) {
        segments.push({ type: 'text', content: textBefore });
    }

    segments.push({ type: 'link', content: link });

    if (textAfter.length > 0) {
        segments.push({ type: 'text', content: textAfter });
    }

    return segments;
});
</script>

<template>
  <div class="leading-6 text-sm">
    <template v-for="(segment, index) in parsedMessage" :key="`${index}-${segment.content}`">
      <span v-if="segment.type === 'text'">{{ segment.content }}</span>
      <a
        v-else-if="segment.type === 'link'"
        :href="segment.content"
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-500 hover:underline font-medium"
        @click.stop=""
      >
        {{ segment.content }}
      </a>
    </template>
  </div>
</template>
