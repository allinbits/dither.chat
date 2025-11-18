<script setup lang="ts">
import { SlidersHorizontal } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import FilterPhoton from '@/components/ui/filter/FilterPhoton.vue';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SearchInput } from '@/components/ui/search';
import ColorModeSwitch from '@/components/ui/switch/ColorModeSwitch.vue';
import WalletConnectButtonMobile from '@/components/wallet/WalletConnectButton/WalletConnectButtonMobile.vue';
</script>

<template>
  <header class="h-full w-full flex flex-row items-center justify-between border-b bg-background px-4 gap-2">
    <div class="size-[40px]">
      <WalletConnectButtonMobile />
    </div>

    <div class="flex flex-row items-center gap-2">
      <SearchInput class="self-start" />
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="icon" size="iconSm">
            <SlidersHorizontal class="size-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <FilterPhoton />
        </PopoverContent>
      </Popover>
    </div>

    <ColorModeSwitch />
  </header>
</template>
