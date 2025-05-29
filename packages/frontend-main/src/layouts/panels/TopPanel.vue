<script setup lang="ts">
import Filters from '@/components/filters/filters.vue';
import ToggleThemeButton from '@/components/ToggleThemeButton.vue';
import Icon from '@/components/ui/icon/Icon.vue';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import SearchInput from '@/components/ui/search/SearchInput.vue';
import WalletConnect from '@/components/wallet/WalletConnect.vue';

</script>

<template>
  <header class="h-full w-full flex flex-row items-center justify-between border-b bg-background px-4 gap-4">
    <WalletConnect class="w-[40px] h-full flex justify-center items-center" />
    <Popover>
      <PopoverTrigger>
        <div class="flex flex-row items-center justify-center cursor-pointer">
          <Icon icon="filter" class="ml-2" :size="2" />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <Filters />
      </PopoverContent>
    </Popover>

    <!-- <input placeholder="search" class="bg-neutral-200 p-2 h-[40px] min-w-[140px]"> -->
    <SearchInput class="self-start mt-2" />
    <ToggleThemeButton />
  </header>
</template>
