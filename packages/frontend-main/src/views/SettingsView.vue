<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

import Button from '@/components/ui/button/Button.vue';
import MainLayout from '@/layouts/MainLayout.vue';

import ViewHeading from './ViewHeading.vue';
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <ViewHeading :title="$t('components.Headings.settings')" />

      <div class="flex flex-col">
        <RouterLink to="/settings/manage-following" class="border-b">
          <Button size="sm" class="w-full text-left py-8" variant="ghost">
            <span class="grow pl-2">
              {{ $t('components.Headings.manageFollows') }}
            </span>
            <ChevronRight class="size-4" />
          </Button>
        </RouterLink>

        <RouterLink to="/settings/env-config" class="border-b">
          <Button size="sm" class="w-full text-left py-8" variant="ghost">
            <span class="grow pl-2">
              {{ $t('components.Headings.envConfig') }}
            </span>
            <ChevronRight class="size-4" />
          </Button>
        </RouterLink>

        <RouterLink to="/settings/settings-single-session" class="border-b">
          <Button size="sm" class="w-full text-left py-8" variant="ghost">
            <span class="grow pl-2">
              {{ $t('components.Settings.singleSession') }}
            </span>
            <ChevronRight class="size-4" />
          </Button>
        </RouterLink>

        <RouterLink to="/settings/default-amount" class="border-b">
          <Button size="sm" class="w-full text-left py-8" variant="ghost">
            <span class="grow pl-2">
              {{ $t('components.Settings.defaultAmount') }}
            </span>
            <ChevronRight class="size-4" />
          </Button>
        </RouterLink>
      </div>
    </div>
  </MainLayout>
</template>
