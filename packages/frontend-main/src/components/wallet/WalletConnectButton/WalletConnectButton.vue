<script lang="ts" setup>
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
} from '@/components/ui/popover';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import { useAccount } from '@/composables/useAccount';
import { useWallet } from '@/composables/useWallet';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

import WalletConnectPopoverContent from './WalletConnectPopoverContent.vue';

const isConnecting = ref(false);
const isError = ref(false);

const { address, loggedIn } = useWallet();
const { data: account } = useAccount({ address });
const walletDialogStore = useWalletDialogStore();

const connectedState = computed(() => !isConnecting.value && loggedIn.value && !isError.value);
</script>

<template>
  <div>
    <!-- Normal signed in account display -->
    <template v-if="connectedState">
      <Popover>
        <PopoverTrigger class="w-full">
          <UserAvatarUsername :user-address="address" disabled class="h-[52px] px-4 gap-3 rounded-sm hover:bg-accent active:bg-accent transition-colors" />
        </PopoverTrigger>

        <div v-if="account?.handle" class="w-full text-center text-sm text-base">
          @{{ account.handle }}
        </div>

        <WalletConnectPopoverContent />
      </Popover>
    </template>

    <template v-else>
      <Button class="w-[207px]" @click="walletDialogStore.showDialog">
        {{ $t('components.WalletConnect.button') }}
      </Button>
    </template>
  </div>
</template>
