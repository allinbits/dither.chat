<script setup lang="ts">
import type { Component } from 'vue';

import type { SocialLink } from '../composables/useSocialLinks';
import type { SocialProvider } from '../providers/registry';

import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-vue-next';
import { computed, reactive, ref, toRef, watchEffect } from 'vue';

import { useWallet } from '@/composables/useWallet';

import { useSocialLinks } from '../composables/useSocialLinks';
import { providers } from '../providers/registry';
import SocialProviderRow from './SocialProviderRow.vue';

const props = withDefaults(
  defineProps<{
    address: string;
    verificationCode?: string;
    editable?: boolean;
  }>(),
  {
    verificationCode: '',
    editable: true,
  },
);

const wallet = useWallet();

const isExpanded = ref(true);
const expandedProvider = ref<string | null>(null);
const proofUrls = reactive<Record<string, string>>({});
const isClaimLoading = ref<string | null>(null);
const optimisticPendingByProvider = reactive<Record<string, string | null>>({});

const pollingInterval = ref<number | false>(false);

const { data: socialLinksData } = useSocialLinks({
  address: toRef(() => props.address),
  refetchInterval: pollingInterval,
});

watchEffect(() => {
  const hasOptimisticPending = Object.values(optimisticPendingByProvider).some(Boolean);
  const hasServerPending = (socialLinksData.value ?? []).some(link => link.status === 'pending');
  pollingInterval.value = hasOptimisticPending || hasServerPending ? 3000 : false;
});

const verifiedLinks = computed(() =>
  (socialLinksData.value ?? [])
    .filter(link => link.status === 'verified')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
);

interface VerifiedLinkEntry {
  link: SocialLink;
  icon: Component;
  handle: string;
  href: string;
}

const verifiedLinksWithProvider = computed<VerifiedLinkEntry[]>(() =>
  verifiedLinks.value.reduce<VerifiedLinkEntry[]>((entries, link) => {
    const provider = providers.find(providerEntry => providerEntry.id === link.platform);
    if (!provider) return entries;
    const handle = link.handle.split('@')[0];
    entries.push({
      link,
      icon: provider.icon,
      handle,
      href: provider.profileUrl(handle),
    });
    return entries;
  }, []),
);

watchEffect(() => {
  const links = socialLinksData.value ?? [];

  for (const [providerId, handle] of Object.entries(optimisticPendingByProvider)) {
    if (!handle) continue;

    const hasServerState = links.some(link =>
      link.platform === providerId
      && link.handle.split('@')[0].toLowerCase() === handle.toLowerCase(),
    );

    if (hasServerState) {
      optimisticPendingByProvider[providerId] = null;
    }
  }
});

async function onClaim(provider: SocialProvider) {
  const url = proofUrls[provider.id] ?? '';
  const username = provider.extractUsername(url);
  if (!username) return;

  isClaimLoading.value = provider.id;
  try {
    await wallet.dither.send('LinkSocial', {
      args: [username, provider.id, url],
    });
    optimisticPendingByProvider[provider.id] = username;
    expandedProvider.value = null;
    proofUrls[provider.id] = '';
  } catch (error) {
    console.error(`Failed to claim ${provider.label} verification:`, error);
  } finally {
    isClaimLoading.value = null;
  }
}
</script>

<template>
  <div v-if="editable || verifiedLinksWithProvider.length" class="border-t px-4 py-3">
    <button
      class="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <span>Social Accounts</span>
      <ChevronDown v-if="!isExpanded" class="w-4 h-4" />
      <ChevronUp v-else class="w-4 h-4" />
    </button>

    <div v-if="isExpanded" class="mt-3 space-y-2">
      <slot name="helper" />

      <template v-if="editable">
        <SocialProviderRow
          v-for="provider in providers"
          :key="provider.id"
          :provider="provider"
          :address="address"
          :verification-code="verificationCode"
          :social-links="socialLinksData ?? []"
          :expanded="expandedProvider === provider.id"
          :proof-url="proofUrls[provider.id] ?? ''"
          :is-claim-loading="isClaimLoading === provider.id"
          :optimistic-pending-handle="optimisticPendingByProvider[provider.id] ?? null"
          @update:expanded="expandedProvider = $event ? provider.id : null"
          @update:proof-url="proofUrls[provider.id] = $event"
          @claim="onClaim(provider)"
        />
      </template>
      <div v-else-if="verifiedLinksWithProvider.length" class="flex flex-col gap-2">
        <a
          v-for="entry in verifiedLinksWithProvider"
          :key="entry.link.id"
          :href="entry.href"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex w-auto items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <component :is="entry.icon" class="w-[1em] h-[1em] mr-1" />
          <span>@{{ entry.handle }}</span>
          <ArrowUpRight class="w-[1em] h-[1em] ml-1" />
        </a>
      </div>
    </div>
  </div>
</template>
