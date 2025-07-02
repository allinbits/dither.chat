<script setup lang="ts">
import { SlidersHorizontal } from 'lucide-vue-next';

import FilterPhoton from '@/components/ui/filter/FilterPhoton.vue';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import SearchInput from '@/components/ui/search/SearchInput.vue';
import ColorModeSwitch from '@/components/ui/switch/ColorModeSwitch.vue';
import WalletConnectButtonMobile from '@/components/wallet/WalletConnectButton/WalletConnectButtonMobile.vue';

</script>

<template>
  <header class="h-full w-full flex flex-row items-center gap-2 justify-between px-4 border-b bg-background !transition-[background-color,border-color]">
    <WalletConnectButtonMobile class="w-[40px] h-full flex justify-center items-center" />

    <div class="flex flex-row items-center gap-2">
      <SearchInput class="self-start" />
      <Popover>
        <PopoverTrigger>
          <div class="flex flex-row items-center justify-center size-[40px] rounded-xs hover:bg-accent active:bg-accent transition-[background-color]">
            <SlidersHorizontal class="size-6" />
          </div>
        </PopoverTrigger>
        <PopoverContent class="!transition-[background-color,border-color]">
          <FilterPhoton />
        </PopoverContent>
      </Popover>
    </div>

    <ColorModeSwitch />
  </header>
</template>
