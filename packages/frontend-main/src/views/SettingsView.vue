<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

import Button from '@/components/ui/button/Button.vue';
import MainLayout from '@/layouts/MainLayout.vue';
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <h1 class="text-lg font-semibold border-b !transition-[border-color] px-4 py-4">
        {{ $t(`components.Titles.settings`) }}
      </h1>
      <div class="flex flex-col">
        <RouterLink to="/settings/manage-followers" class="border-b !transition-[border-color]">
          <Button size="sm" class="w-full text-left py-8 !transition-[opacity,background-color]" variant="ghost">
            <span class="grow pl-2">
              {{ $t('components.Settings.manageFollows') }}
            </span>
            <ChevronRight class="size-4" />
          </Button>
        </RouterLink>

        <RouterLink to="/settings/env-config" class="border-b !transition-[border-color]">
          <Button size="sm" class="w-full text-left py-8 !transition-[opacity,background-color]" variant="ghost">
            <span class="grow pl-2">
              {{ $t('components.Settings.envConfig') }}
            </span>
            <ChevronRight class="size-4" />
          </Button>
        </RouterLink>
      </div>
    </div>
  </MainLayout>
</template>
