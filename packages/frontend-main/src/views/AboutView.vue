<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';

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
            <a
              :href="externalLinks.atomoneWebsite"
              target="_blank"
              rel="noopener noreferrer"
              class="text-foreground hover:underline transition-colors"
            >
              {{ $t('components.About.atomoneLink') }}
            </a>.
          </p>
          <p class="text-base text-muted-foreground/75">
            {{ $t('components.About.coreDesc') }}
          </p>
        </div>

        <a
          :href="externalLinks.protocolDocs"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-muted-foreground/80 hover:text-foreground transition-colors flex items-center gap-1"
        >
          {{ $t('components.About.ctaDocs') }}
          <ArrowUpRight class="size-3" />
        </a>

        <div class="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground/80 mt-12 border-t border-border/40 pt-5 w-full">
          <a
            :href="externalLinks.privacyPolicy"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-foreground transition-colors"
          >
            {{ $t('components.About.ctaPrivacy') }}
          </a>
          <span aria-hidden="true">•</span>
          <a
            :href="externalLinks.termsOfService"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-foreground transition-colors"
          >
            {{ $t('components.About.ctaTerms') }}
          </a>
          <span aria-hidden="true">•</span>
          <a
            :href="externalLinks.githubRepo"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-foreground transition-colors"
          >
            {{ $t('components.About.ctaGitHub') }}
          </a>
          <span aria-hidden="true">•</span>
          <a
            :href="externalLinks.telegramBot"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-foreground transition-colors"
          >
            {{ $t('components.About.ctaTelegram') }}
          </a>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
