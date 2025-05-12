<script setup lang="ts">
import ToggleThemeButton from './components/ui/ToggleThemeButton.vue';

import WalletConnect from '@/components/popups/WalletConnect.vue';

</script>

<template>
  <div class="flex flex-col w-screen h-screen overflow-x-hidden overflow-y-auto items-center">
    <div class="flex flex-row w-full h-full justify-center max-w-[1280px]">
      <!-- TODO: Make left menu -->
      <!-- This should probably stick -->
      <div class="flex flex-col p-6 h-full w-[380px] gap-6">
        <div class="text-2xl">Dither</div>
        <nav class="flex flex-col">
          <RouterLink to="/" activeClass="font-bold">Home</RouterLink>
          <RouterLink to="/notifications" activeClass="font-bold">Notifications</RouterLink>
          <!-- TODO: Use current user address -->
          <RouterLink to="/profile/:address" activeClass="font-bold">My Profile</RouterLink>
          <!-- TODO: Remove this after testing -->
          <RouterLink to="/post?hash=9c0f718289998024ce7c83b24f350e3fc4fa0c3d5c421c5042422c8721eec3e0" activeClass="font-bold">Post #1</RouterLink>
        </nav>
        <WalletConnect />
      </div>

      <div class="flex flex-col border-x border-neutral-200 h-full grow min-w-[600px]">
        <main>
          <RouterView />
        </main>
      </div>

      <!-- TODO: Make right menu -->
      <!-- This should probably stick -->
      <div class="flex flex-col w-[380px] p-6 h-full">
        <ToggleThemeButton/>
        <input placeholder="search" class="bg-neutral-200 p-2 w-full" />
      </div>
    </div>
  </div>
</template>
