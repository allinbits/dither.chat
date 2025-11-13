<script lang="ts" setup>
import {
  PopoverContent,
} from '@/components/ui/popover';
import { useWallet } from '@/composables/useWallet';

const { signOut } = useWallet();
</script>

<template>
  <PopoverContent>
    <div class="flex flex-col gap-4">
      <button
        class="flex items-center justify-center flex-row h-11 px-3 gap-2.5 rounded-md border border-border/70 bg-background/60 backdrop-blur-sm shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] hover:border-border hover:bg-background/85 hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.12)] active:bg-background/95 active:shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] transition-all duration-200 w-full text-base font-semibold"
        @click="signOut()"
      >
        {{ $t('components.WalletConnect.disconnect') }}
      </button>
    </div>
  </PopoverContent>
</template>
