<script setup lang="ts">

import WalletConnect from '@/components/popups/WalletConnect.vue';

</script>

<template>
  <!-- TODO: Make left menu -->
  <!-- This should probably stick -->
  <header
    class="flex flex-col items-center p-5 gap-6 overflow-y-auto fixed right-[calc(50%+(var(--main-max-width)/2))] w-[358px] h-full border-r border-neutral-200">
    <div class="flex flex-col">
      <div class="text-2xl">Dither
        <nav class="flex flex-col">
          <RouterLink to="/" activeClass="font-bold">Home</RouterLink>
          <RouterLink to="/notifications" activeClass="font-bold">Notifications</RouterLink>
          <!-- TODO: Use current user address -->
          <RouterLink to="/profile/:address" activeClass="font-bold">My Profile</RouterLink>
          <!-- TODO: Remove this after testing -->
          <RouterLink to="/post?hash=9c0f718289998024ce7c83b24f350e3fc4fa0c3d5c421c5042422c8721eec3e0"
                      activeClass="font-bold">Post #1</RouterLink>
        </nav>
        <WalletConnect />
      </div>
    </div>
  </header>

</template>
