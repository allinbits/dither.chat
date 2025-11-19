<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';

import { useExternalLink } from '@/composables/useExternalLink';
import { useSEO } from '@/composables/useSEO';
import { externalLinks } from '@/config/externalLinks';
import MainLayout from '@/layouts/MainLayout.vue';

useSEO({
  title: 'About Dither - Open Blockchain Messaging Protocol | dither.chat',
  description: 'Dither is an open messaging protocol built on blockchain. Decentralized social messaging, onchain posts, and durable protocol for Web3. Built on AtomOne blockchain.',
  ogTitle: 'About Dither - Open Blockchain Messaging Protocol',
  ogDescription: 'Open messaging protocol built on blockchain. Decentralized social messaging, onchain posts, and durable protocol for Web3.',
  ogUrl: `${externalLinks.siteUrl}/about`,
});

const { openExternalLink } = useExternalLink();
</script>

<template>
  <MainLayout>
    <div class="flex flex-col min-h-full">
      <div class="flex flex-col items-center justify-center gap-12 px-6 py-20 max-w-3xl mx-auto w-full min-h-[calc(100vh-220px)] text-center">
        <h1 class="text-7xl font-bold tracking-tight leading-none">
          dither
        </h1>

        <div class="flex flex-col gap-4 max-w-2xl">
          <p class="text-3xl text-foreground font-semibold leading-snug tracking-tight">
            {{ $t('components.About.heroTagline') }}
          </p>
          <p class="text-base text-muted-foreground leading-relaxed">
            Posts are stored permanently on
            <button
              class="text-foreground hover:underline transition-colors"
              @click="openExternalLink('atomoneWebsite')"
            >
              {{ $t('components.About.atomoneLink') }}
            </button>.
          </p>
          <p class="text-base text-muted-foreground/75">
            {{ $t('components.About.coreDesc') }}
          </p>
        </div>

        <button
          class="text-sm text-muted-foreground/80 hover:text-foreground transition-colors flex items-center gap-1"
          @click="openExternalLink('protocolDocs')"
        >
          {{ $t('components.About.ctaDocs') }}
          <ArrowUpRight class="size-3" />
        </button>

        <div class="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground/80 mt-12 border-t border-border/40 pt-5 w-full">
          <button
            class="hover:text-foreground transition-colors"
            @click="openExternalLink('privacyPolicy')"
          >
            {{ $t('components.About.ctaPrivacy') }}
          </button>
          <span aria-hidden="true">•</span>
          <button
            class="hover:text-foreground transition-colors"
            @click="openExternalLink('termsOfService')"
          >
            {{ $t('components.About.ctaTerms') }}
          </button>
          <span aria-hidden="true">•</span>
          <button
            class="hover:text-foreground transition-colors"
            @click="openExternalLink('githubRepo')"
          >
            {{ $t('components.About.ctaGitHub') }}
          </button>
          <span aria-hidden="true">•</span>
          <button
            class="hover:text-foreground transition-colors"
            @click="openExternalLink('telegramBot')"
          >
            {{ $t('components.About.ctaTelegram') }}
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
