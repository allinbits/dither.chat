<script setup lang="ts">
import ToggleThemeButton from '@/components/ToggleThemeButton.vue';
import SearchInput from '@/components/ui/search/SearchInput.vue';
import WalletConnect from '@/components/wallet/WalletConnect.vue';
</script>

<template>
  <header class="h-full w-full flex flex-row items-center justify-between border-b bg-background px-4 gap-4">
    <WalletConnect class="w-[40px] h-full flex justify-center items-center" />
    <!-- <input placeholder="search" class="bg-neutral-200 p-2 h-[40px] min-w-[140px]"> -->
    <SearchInput class="self-start mt-2"/>
    <ToggleThemeButton />
  </header>
</template>
