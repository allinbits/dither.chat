<script setup lang="ts">
import { Loader } from 'lucide-vue-next';

import { useSessionWallet } from '@/composables/useSessionWallet';

import Button from '@/components/ui/button/Button.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import ViewHeading from '@/views/ViewHeading.vue';

const { createSession, clearSession, hasGrants, isUpdating } = useSessionWallet();
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <ViewHeading :title="$t(`components.Settings.singleSession`)"/>
      <div class="flex flex-col text-pretty">
        <!-- Summary of Session Wallet -->
        <div class="flex flex-col border-b">
          <span class="pt-4 pl-4 font-bold">What is it?</span>
          <p class="p-4 text-sm">{{ $t(`components.Settings.singleSessionSummary`) }}</p>
        </div>
        <!-- Invoke Session Wallet -->
        <div class="flex flex-col p-3">
          <template v-if="!isUpdating">
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
          </template>
          <templte v-else>
            <div class="flex items-center justify-center pt-4">
              <Loader  class="animate-spin" :size="24" />
            </div>
          </templte>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
