<script setup lang="ts">
import { Loader } from 'lucide-vue-next';

import Button from '@/components/ui/button/Button.vue';
import { useSessionWallet } from '@/composables/useSessionWallet';
import MainLayout from '@/layouts/MainLayout.vue';
import ViewHeading from '@/views/ViewHeading.vue';

const { createSession, clearSession, hasGrants, isUpdating } = useSessionWallet();
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <ViewHeading :title="$t(`components.Settings.singleSession`)" />
      <div class="flex flex-col text-pretty">
        <!-- Summary of Session Wallet -->
        <div class="flex flex-col border-b">
          <span class="pt-4 pl-4 font-bold">{{ $t(`components.Settings.whatIsIt`) }}</span>
          <p class="p-4 text-sm">
            {{ $t(`components.Settings.singleSessionSummary`) }}
          </p>
        </div>
        <!-- Invoke Session Wallet -->
        <div class="flex flex-col p-4">
          <template v-if="!isUpdating">
            <Button v-if="!hasGrants" size="sm" class="w-full decoration-2" variant="outline" @click="createSession">
              <span class="grow">
                {{ $t('components.Settings.createSession') }}
              </span>
            </Button>
            <Button v-else size="sm" class="w-full decoration-2" variant="outline" @click="clearSession">
              <span class="grow">
                {{ $t('components.Settings.revokeSession') }}
              </span>
            </Button>
          </template>
          <template v-else>
            <div class="flex items-center justify-center pt-4">
              <Loader class="animate-spin" :size="24" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
