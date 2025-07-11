<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';

import { useSessionWallet } from '@/composables/useSessionWallet';

import Button from '@/components/ui/button/Button.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const { createSession, clearSession, hasGrants } = useSessionWallet();
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <div class="flex flex-row items-center border-b py-2 pr-4">
        <RouterLink to="/settings" class="w-32">
          <Button size="sm" class="w-full text-left decoration-2" variant="link">
            <ChevronLeft class="size-4" />
            <span class="grow">
              {{ $t('components.Settings.back') }}
            </span>
          </Button>
        </RouterLink>
        <h1 class="font-semibold grow text-right select-none">
          {{ $t(`components.Settings.singleSession`) }}
        </h1>
      </div>
      <div class="flex flex-col text-pretty">
        <!-- Summary of Session Wallet -->
        <div class="flex flex-col border-b">
          <span class="pt-4 pl-4 font-bold">What is it?</span>
          <p class="p-4 text-sm">{{ $t(`components.Settings.singleSessionSummary`) }}</p>
        </div>
        <!-- Invoke Session Wallet -->
        <div class="flex flex-col p-3">
          <Button size="sm" class="w-full decoration-2" variant="outline" @click="createSession" v-if="!hasGrants">
            <span class="grow">
              {{ $t('components.Settings.createSession') }}
            </span>
          </Button>
          <Button size="sm" class="w-full decoration-2" variant="outline" @click="clearSession" v-else>
            <span class="grow">
              {{ $t('components.Settings.revokeSession') }}
            </span>
          </Button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
