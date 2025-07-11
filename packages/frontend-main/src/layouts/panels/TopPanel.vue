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
  <header class="h-full w-full flex flex-row items-center justify-between border-b bg-background px-4 gap-2">
    <div class="size-[40px]">
      <WalletConnectButtonMobile/>
    </div>

    <div class="flex flex-row items-center gap-2">
      <SearchInput class="self-start" />
      <Popover>
        <PopoverTrigger>
          <div class="flex flex-row items-center justify-center size-[40px] rounded-full hover:bg-accent active:bg-accent transition-colors">
            <SlidersHorizontal class="size-6" />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <FilterPhoton />
        </PopoverContent>
      </Popover>
    </div>

    <ColorModeSwitch />
  </header>
</template>
