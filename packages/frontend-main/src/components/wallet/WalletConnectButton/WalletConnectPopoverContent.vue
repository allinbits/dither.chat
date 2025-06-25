<script lang="ts" setup>

import { useWallet } from '@/composables/useWallet';

import { Button } from '@/components/ui/button';
import {
    PopoverContent,
} from '@/components/ui/popover';
const { signOut } = useWallet();

</script>

<template>
  <PopoverContent>
    <div class="flex flex-col gap-4">
      <Button
        class="my-4 justify-center"
        @click="
          signOut();
        "
      >
        {{ $t('components.WalletConnect.disconnect') }}
      </Button>
    </div>
  </PopoverContent>
</template>
