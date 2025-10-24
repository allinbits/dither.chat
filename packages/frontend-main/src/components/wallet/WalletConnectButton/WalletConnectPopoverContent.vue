<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import {
  PopoverContent,
} from '@/components/ui/popover';
import { useWallet } from '@/composables/useWallet';

const { signOut } = useWallet();
</script>

<template>
  <PopoverContent>
    <div class="flex flex-col gap-4">
      <Button
        class="justify-center"
        @click="
          signOut();
        "
      >
        {{ $t('components.WalletConnect.disconnect') }}
      </Button>
    </div>
  </PopoverContent>
</template>
