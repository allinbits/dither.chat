<script setup lang="ts">
import type { SocialLink } from '../composables/useSocialLinks';
import type { SocialProvider } from '../providers/registry';

import { BadgeCheck, Circle, Clock, Loader, XCircle } from 'lucide-vue-next';
import { computed } from 'vue';

import Button from '@/components/ui/button/Button.vue';
import { CopyToClipboard } from '@/components/ui/copy';

const props = withDefaults(defineProps<{
  provider: SocialProvider;
  address: string;
  verificationCode: string;
  expanded: boolean;
  proofUrl: string;
  isClaimLoading: boolean;
  optimisticPendingHandle?: string | null;
  socialLinks?: SocialLink[];
}>(), {
  optimisticPendingHandle: null,
  socialLinks: () => [],
});

defineEmits<{
  'update:expanded': [value: boolean];
  'update:proofUrl': [value: string];
  'claim': [];
}>();

const providerLinks = computed(() =>
  props.socialLinks
    .filter(link => link.platform === props.provider.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
);

const pendingLinks = computed(() => providerLinks.value.filter(link => link.status === 'pending'));
const verifiedLinks = computed(() => providerLinks.value.filter(link => link.status === 'verified'));
const failedLinks = computed(() => providerLinks.value.filter(link => link.status === 'failed'));
const hasActiveFailed = computed(() => failedLinks.value.length > 0);
const optimisticPendingHandle = computed(() => {
  if (!props.optimisticPendingHandle) return null;

  const hasServerState = providerLinks.value.some(link =>
    link.handle.split('@')[0].toLowerCase() === props.optimisticPendingHandle?.toLowerCase(),
  );
  if (hasServerState) return null;

  return props.optimisticPendingHandle;
});
const hasAnyPending = computed(() => pendingLinks.value.length > 0 || !!optimisticPendingHandle.value);

const parsedUsername = computed(() =>
  props.proofUrl ? props.provider.extractUsername(props.proofUrl) : null,
);

const isUrlInvalid = computed(() => !!props.proofUrl && parsedUsername.value === null);
const proofContent = computed(() => props.provider.proofContent(props.verificationCode));
</script>

<template>
  <div class="border rounded-lg overflow-hidden">
    <div
      v-for="link in verifiedLinks"
      :key="link.id"
      class="flex items-center justify-between p-3 text-sm border-b last:border-b-0"
    >
      <div class="flex items-center gap-2">
        <component :is="provider.icon" class="w-4 h-4" />
        <span>@{{ link.handle.split('@')[0] }}</span>
      </div>
      <BadgeCheck class="w-4 h-4" />
    </div>

    <div
      v-for="link in pendingLinks"
      :key="link.id"
      title="Verification pending"
      class="flex items-center justify-between p-3 text-sm border-b last:border-b-0"
    >
      <div class="flex items-center gap-2">
        <component :is="provider.icon" class="w-4 h-4" />
        <span>@{{ link.handle.split('@')[0] }}</span>
      </div>
      <Clock class="w-4 h-4 text-yellow-500" />
    </div>
    <div
      v-if="optimisticPendingHandle"
      title="Verification pending"
      class="flex items-center justify-between p-3 text-sm border-b last:border-b-0"
    >
      <div class="flex items-center gap-2">
        <component :is="provider.icon" class="w-4 h-4" />
        <span>@{{ optimisticPendingHandle }}</span>
      </div>
      <Clock class="w-4 h-4 text-yellow-500" />
    </div>

    <div
      v-for="link in failedLinks"
      :key="link.id"
      title="Verification failed"
      class="flex items-center justify-between p-3 text-sm border-b last:border-b-0"
    >
      <div class="flex items-center gap-2">
        <component :is="provider.icon" class="w-4 h-4" />
        <span>@{{ link.handle.split('@')[0] }}</span>
      </div>
      <XCircle class="w-4 h-4 text-destructive" />
    </div>

    <button
      v-if="!hasAnyPending && (!verifiedLinks.length || hasActiveFailed)"
      class="w-full flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors"
      @click="$emit('update:expanded', !expanded)"
    >
      <div class="flex items-center gap-2">
        <component :is="provider.icon" class="w-4 h-4" />
        <span>{{ hasActiveFailed ? `Retry ${provider.label} verification` : `Prove your ${provider.label} account` }}</span>
      </div>
      <XCircle v-if="hasActiveFailed" class="w-4 h-4 text-destructive" />
      <Circle v-else class="w-4 h-4 text-muted-foreground" />
    </button>

    <div v-if="expanded && !hasAnyPending" class="px-3 pb-3 space-y-3 border-t">
      <div class="pt-3 space-y-2">
        <p class="provider-instructions text-sm text-foreground" v-html="`1. ${provider.instructionsHtml}`" />
        <div class="relative rounded-md border bg-muted/40 p-2">
          <CopyToClipboard
            :text="proofContent"
            class="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          />
          <pre class="text-xs whitespace-pre-wrap break-words font-mono pr-7">{{ proofContent }}</pre>
        </div>
      </div>

      <div>
        <Button
          as="a"
          variant="outline"
          size="sm"
          :href="provider.helpUrl(verificationCode)"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2"
        >
          <component :is="provider.icon" class="w-4 h-4" />
          {{ provider.helpLabel }}
        </Button>
      </div>

      <div>
        <p class="text-sm text-foreground mb-1">
          2. Paste your proof URL:
        </p>
        <input
          :value="proofUrl"
          type="url"
          :placeholder="provider.proofPlaceholder"
          class="w-full px-3 py-2 text-sm border rounded-md bg-background"
          @input="$emit('update:proofUrl', ($event.target as HTMLInputElement).value)"
        >
        <p v-if="isUrlInvalid" class="text-xs text-muted-foreground mt-1">
          URL doesn't match expected format
        </p>
      </div>

      <p v-if="parsedUsername" class="text-xs text-muted-foreground">
        Username: <span class="font-medium">@{{ parsedUsername }}</span>
      </p>

      <Button
        size="sm"
        :disabled="!parsedUsername || isClaimLoading"
        @click="$emit('claim')"
      >
        <Loader v-if="isClaimLoading" class="w-4 h-4 animate-spin mr-2" />
        Claim
      </Button>
    </div>
  </div>
</template>
