<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{ message: string }>();

// Define the segment interface for clarity
interface MessageSegment {
    type: 'text' | 'link';
    content: string;
}

/**
 * Extracts the first generic HTTP/HTTPS URL from the message.
 */
function extractGenericLink(msg: string) {
    // Regex for any http/https URL, stopping at a whitespace or end of string.
    const urlRegex = /(https?:\/\/[^\s]+)/i;
    const match = msg.match(urlRegex);

    if (match && match[1]) {
        return match[1];
    }
    return null;
}

/**
 * Parses the message string into an array of text and link segments.
 * This is the safe method to render mixed content without v-html.
 */
const parsedMessage = computed((): MessageSegment[] => {
    const message = props.message;
    const link = extractGenericLink(message);
    const segments: MessageSegment[] = [];

    if (!link) {
        // If no link is found, return the entire message as a single text segment
        segments.push({ type: 'text', content: message });
        return segments;
    }

    // Split the message only once based on the link.
    const parts = message.split(link, 2);
    const textBefore = parts[0];
    const textAfter = parts.length > 1 ? parts[1] : '';

    // 1. Add the segment before the link (if present)
    if (textBefore.length > 0) {
        segments.push({ type: 'text', content: textBefore });
    }

    // 2. Add the link segment
    segments.push({ type: 'link', content: link });

    // 3. Add the segment after the link (if present)
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
