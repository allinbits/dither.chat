<script setup lang="ts">
import { SlidersHorizontal } from 'lucide-vue-next';

import ToggleThemeButton from '@/components/ToggleThemeButton.vue';
import FilterPhoton from '@/components/ui/filter/FilterPhoton.vue';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import SearchInput from '@/components/ui/search/SearchInput.vue';
import WalletConnect from '@/components/wallet/WalletConnect.vue';

</script>

<template>
  <header class="h-full w-full flex flex-row items-center justify-between border-b bg-background px-4 gap-2">
    <WalletConnect class="w-[40px] h-full flex justify-center items-center" />

    <div class="flex flex-row items-center gap-2">
      <SearchInput class="self-start" />
      <Popover>
        <PopoverTrigger>
          <div class="flex flex-row items-center justify-center size-[40px]">
            <SlidersHorizontal class="size-6" />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <FilterPhoton />
        </PopoverContent>
      </Popover>
    </div>

    <ToggleThemeButton />
  </header>
</template>
