<script lang="ts" setup>
import type { Ref } from 'vue';

import { bech32 } from 'bech32';
import { Link2, Loader } from 'lucide-vue-next';
import { VisuallyHidden } from 'reka-ui';
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import Icon from '@/components/ui/icon/Icon.vue';
import Input from '@/components/ui/input/Input.vue';
import UserBalance from '@/components/users/UserBalance.vue';
import { getWalletHelp, useWallet, Wallets } from '@/composables/useWallet';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { getChainConfigLazy } from '@/utility/getChainConfigLazy';
import { shorten } from '@/utility/text';
import ConnectButton from './WalletExtensionButton.vue';

const chainConfig = getChainConfigLazy();

const isConnecting = ref(false);
const isError = ref(false);
const isSlowConnecting = ref(false);
const isAddressOnlyConnection = ref(false);

const publicAddress = ref('');

const { connect, signOut, address, loggedIn, keplr, leap, cosmostation } = useWallet();
const walletDialogStore = useWalletDialogStore();

const selectState = computed(
  () => !isConnecting.value && !loggedIn.value && !isError.value && !isAddressOnlyConnection.value,
);
const addressState = computed(
  () => !isConnecting.value && !loggedIn.value && !isError.value && isAddressOnlyConnection.value,
);
const connectingState = computed(() => isConnecting.value && !loggedIn.value && !isError.value);
const connectedState = computed(() => !isConnecting.value && loggedIn.value && !isError.value);
const viewState = computed(() => !isConnecting.value && loggedIn.value && !isError.value);
const errorState = computed(() => isError.value);

const controller: Ref<AbortController | null> = ref(null);
const chosenWallet: Ref<Wallets> = ref(Wallets.keplr);

async function connectWallet(walletType: Wallets, address?: string) {
  if (walletType === Wallets.addressOnly && !address) {
    isAddressOnlyConnection.value = true;
    return;
  }

  if (window.keplr) {
    window.keplr.defaultOptions = {
      sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
    };
  }
  if (window.leap) {
    window.leap.defaultOptions = {
      sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
    };
  }
  isAddressOnlyConnection.value = false;
  isError.value = false;
  isConnecting.value = true;
  isSlowConnecting.value = false;
  chosenWallet.value = walletType;
  let slow: ReturnType<typeof setTimeout> | null = null;
  controller.value = new AbortController();
  try {
    slow = setTimeout(() => (isSlowConnecting.value = true), 10000);
    if (walletType === Wallets.addressOnly && address) {
      await connect(walletType, address, controller.value.signal);
    } else {
      await connect(walletType, undefined, controller.value.signal);
    }
    isConnecting.value = false;
    isSlowConnecting.value = false;
    if (slow) {
      clearTimeout(slow);
      slow = null;
    }

    // Call the callback if it exists then clear it
    if (walletDialogStore.onWalletConnected) {
      walletDialogStore.onWalletConnected();
      walletDialogStore.onWalletConnected = null;
    }
  } catch (err) {
    console.error(err);
    isConnecting.value = false;
    isSlowConnecting.value = false;
    isError.value = true;
    if (slow) {
      clearTimeout(slow);
      slow = null;
    }
  }
}
function openWalletHelp() {
  window.open(getWalletHelp(chosenWallet.value), '_blank');
}
function cancelConnect() {
  controller.value?.abort();
  isConnecting.value = false;
  isSlowConnecting.value = false;
  isError.value = false;
  isAddressOnlyConnection.value = false;
  publicAddress.value = '';
}
const isValidAddress = computed(() => {
  try {
    const decoded = bech32.decode(publicAddress.value);
    if (decoded.prefix === chainConfig.value.bech32Config.bech32PrefixAccAddr) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
});
</script>

<template>
  <Dialog v-model:open="walletDialogStore.isOpen" @update:open="cancelConnect">
    <DialogContent>
      <VisuallyHidden>
        <DialogTitle />
        <DialogDescription />
      </VisuallyHidden>
      <template v-if="selectState">
        <div class="flex flex-col gap-6">
          <div class="text-xl font-bold text-center">
            {{ $t('components.WalletConnect.cta') }}
          </div>
          <div class="flex flex-col gap-4">
            <span class="text-muted-foreground text-center mb-4">
              {{ $t('components.WalletConnect.otherWallet') }}
            </span>
            <div class="flex flex-col gap-3">
              <Button :disabled="!keplr" @click="connectWallet(Wallets.keplr)">
                <Icon icon="keplr" :size="1.25" />
                <span>Keplr Wallet</span>
              </Button>
              <Button :disabled="!leap" @click="connectWallet(Wallets.leap)">
                <Icon icon="leap" :size="1.25" />
                <span>Leap Wallet</span>
              </Button>
              <Button :disabled="!cosmostation" @click="connectWallet(Wallets.cosmostation)">
                <Icon icon="cosmostation" :size="1.25" />
                <span>Cosmostation Wallet</span>
              </Button>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="addressState">
        <div class="flex flex-col px-8 py-4 pt-12 bg-grey-300 rounded w-80 relative gap-4">
          <div class="flex flex-col font-semibold">
            {{ $t('components.WalletConnect.ctaAddress') }}
          </div>
          <div class="flex flex-col text-muted-foreground font-medium">
            {{ $t('components.WalletConnect.enterAddress') }}
          </div>
          <Input
            v-model="publicAddress"
            :placeholder="$t('components.WalletConnect.addressPlaceholder')"
          />
          <div class="flex flex-col gap-4">
            <ConnectButton
              v-if="isValidAddress"
              class="justify-center link-gradient"
              @click="connectWallet(Wallets.addressOnly, publicAddress)"
            >
              {{ $t('components.WalletConnect.ctaAddress') }}
            </ConnectButton>
            <ConnectButton class="justify-center" @click="isAddressOnlyConnection = false">
              {{ $t('components.WalletConnect.cancel') }}
            </ConnectButton>
          </div>
          <span class="font-semibold">
            {{ $t('components.WalletConnect.publicAddressDisclaimer') }}
          </span>
        </div>
      </template>

      <!-- Normal signed in account display -->
      <template v-else-if="connectedState">
        <div class="flex align-center items-stretch cursor-pointer">
          <div class="bg-gradient w-10 h-10 rounded-full mr-3" />
          <div class="flex flex-col justify-around">
            <span>{{ shorten(address) }}</span>

            <div class="text-muted-foreground">
              <UserBalance :address="address" /> {{ chainConfig.stakeCurrency.coinDenom }}
            </div>
          </div>
        </div>
      </template>

      <!-- Normal signed in account extended -->
      <template v-else-if="viewState">
        <div>
          <div class="flex flex-col px-8 py-4 pt-12 bg-grey-300 rounded w-80 relative">
            <div class="flex align-center items-stretch">
              <div class="bg-gradient w-10 h-10 rounded-full mr-3" />
              <div class="flex flex-col justify-around">
                <span>{{ shorten(address) }}</span>
              </div>
            </div>
            <div class="text-muted-foreground pt-6 pb-2">
              {{ $t('components.WalletConnect.balance') }}
            </div>
            <div class="text-muted-foreground">
              <UserBalance :address="address" /> {{ chainConfig.stakeCurrency.coinDenom }}
            </div>
            <ConnectButton class="my-4 justify-center" @click="signOut()">
              {{ $t('components.WalletConnect.disconnect') }}
            </ConnectButton>
          </div>
        </div>
      </template>

      <!-- Connection in progress -->
      <template v-else-if="connectingState">
        <div class="flex flex-col gap-4 items-center">
          <div class="text-xl font-bold">
            {{ $t('components.WalletConnect.connecting') }}
          </div>
          <div class="text-muted-foreground">
            {{ $t('components.WalletConnect.wait') }}
          </div>

          <div class="flex justify-center">
            <Loader class="animate-spin" :size="24" />
          </div>

          <ConnectButton
            @click="
              () => {
                cancelConnect();
              }
            "
          >
            {{ $t('components.WalletConnect.cancel') }}
          </ConnectButton>

          <div v-if="isSlowConnecting" class="flex flex-col items-center mt-2">
            <span class="text-muted-foreground">{{ $t('components.WalletConnect.slow') }}</span>
            <Button

              variant="link"
              @click="openWalletHelp"
            >
              {{ chosenWallet }} {{ $t('components.WalletConnect.trouble') }}
              <Link2 class="size-5" />
            </Button>
          </div>
        </div>
      </template>

      <!-- Connection failed -->
      <template v-if="errorState">
        <div class="flex flex-col gap-4 items-center">
          <div class="text-xl font-bold mt-4">
            {{ $t('components.WalletConnect.failed') }}
          </div>
          <div class="text-muted-foreground mb-4">
            {{ $t('components.WalletConnect.failedSub') }}
          </div>

          <div class="gap-4 flex flex-col w-full">
            <ConnectButton
              class="justify-center"
              @click="
                () => {
                  connectWallet(chosenWallet);
                }
              "
            >
              {{ $t('components.WalletConnect.retry') }}
            </ConnectButton>
            <ConnectButton
              class="justify-center"
              @click="
                () => {
                  cancelConnect();
                }
              "
            >
              {{ $t('components.WalletConnect.back') }}
            </ConnectButton>
          </div>

          <Button
            variant="link"
            @click="openWalletHelp"
          >
            {{ chosenWallet }} {{ $t('components.WalletConnect.trouble') }}
            <Link2 class="size-5" />
          </Button>
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>
