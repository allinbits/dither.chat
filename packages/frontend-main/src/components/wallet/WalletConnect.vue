<script lang="ts" setup>

import { computed, ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { Wallet } from 'lucide-vue-next';

import { useWallet } from '@/composables/useWallet';


import UserAvatar from '../users/UserAvatar.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { breakpoints } from '@/utility/breakpoints';
const isXl = useMediaQuery(`(max-width: ${breakpoints.xl - 1}px)`);

const isConnecting = ref(false);
const isError = ref(false);

const { signOut, address, loggedIn } = useWallet();
const walletDialogStore = useWalletDialogStore();

const connectedState = computed(() => !isConnecting.value && loggedIn.value && !isError.value);

</script>

<template>
  <div>
    <!-- Normal signed in account display -->
    <template v-if="connectedState">
      <Popover>
        <PopoverTrigger>
          <UserAvatar v-if="isXl" :userAddress="address"/>
          <UserAvatarUsername v-else :userAddress="address"/>
        </PopoverTrigger>
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
      </Popover>
    </template>

    <template v-else>
      <DialogTrigger asChild>
        <Button @click="walletDialogStore.showDialog" class="w-[207px] xl:inline hidden">
          {{ $t('components.WalletConnect.button') }}
        </Button>
        <div class="flex items-center justify-center flex-row xl:hidden h-[52px]">
          <Wallet class="size-7" />
        </div>
      </DialogTrigger>
    </template>
  </div>
</template>
