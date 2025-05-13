<script lang="ts" setup>
import type { Ref } from 'vue';

import { computed, ref } from 'vue';
import { bech32 } from 'bech32';
import { Wallet } from 'lucide-vue-next';

import { getWalletHelp, useWallet, Wallets } from '@/composables/useWallet';

import ButtonCustom from '../ui/button/button-custom/ButtonCustom.vue';

import chainConfig from '@/chain-config.json';
import UserBalance from '@/components/helper/UserBalance.vue';
import { Button } from '@/components/ui/button';
import ConnectButton from '@/components/ui/ConnectButton.vue';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { shorten } from '@/utility';

const isConnecting = ref(false);
const isError = ref(false);
const isSlowConnecting = ref(false);
const isAddressOnlyConnection = ref(false);

const publicAddress = ref('');

const { connect, signOut, address, loggedIn, keplr, leap, cosmostation } = useWallet();

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

const connectWallet = async (walletType: Wallets, address?: string) => {
    if (walletType == Wallets.addressOnly && !address) {
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
        if (walletType == Wallets.addressOnly && address) {
            await connect(walletType, address, controller.value.signal);
        }
        else {
            await connect(walletType, undefined, controller.value.signal);
        }
        isConnecting.value = false;
        isSlowConnecting.value = false;
        if (slow) {
            clearTimeout(slow);
            slow = null;
        }
    }
    catch (err) {
        console.error(err);
        isConnecting.value = false;
        isSlowConnecting.value = false;
        isError.value = true;
        if (slow) {
            clearTimeout(slow);
            slow = null;
        }
    }
};

const cancelConnect = () => {
    controller.value?.abort();
    isConnecting.value = false;
    isSlowConnecting.value = false;
    isError.value = false;
    isAddressOnlyConnection.value = false;
    publicAddress.value = '';
};
const isValidAddress = computed(() => {
    try {
        const decoded = bech32.decode(publicAddress.value);
        if (decoded.prefix == chainConfig.bech32Config.bech32PrefixAccAddr) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (err) {
        console.error(err);
        return false;
    }
});
</script>

<template>
  <div>
    <!-- Normal signed in account display -->
    <template v-if="connectedState">
      <Popover>
        <PopoverTrigger>
          <div class="flex flex-row items-center justify-center cursor-pointer">
            <div class="bg-secondary w-10 h-10 rounded-full mr-3"></div>
            <div class="flex flex-col justify-around">
              <div class="text-light text-200">{{ shorten(address) }}</div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div class="flex flex-col gap-4">
            <ButtonCustom
              class="my-4 justify-center"
              @click="
                signOut();
              "
            >
              {{ $t('components.WalletConnect.disconnect') }}
            </ButtonCustom>
          </div>
        </PopoverContent>
      </Popover>
    </template>
    <template v-else>
      <Dialog>
        <!-- Normal signed out button -->
        <DialogTrigger>
          <ButtonCustom class="w-[207px] xl:inline hidden">
            {{ $t('components.WalletConnect.button') }}
          </ButtonCustom>
          <div class="flex items-center justify-center flex-row xl:hidden h-[52px]">
            <Wallet class="size-7"/>
          </div>
        </DialogTrigger>
        <DialogContent>
          <template v-if="selectState">
            <div class="flex flex-col gap-6">
              <div class="text-xl font-bold text-center">
                {{ $t('components.WalletConnect.cta') }}
              </div>
              <div class="flex flex-col gap-4">
                <span class="text-muted-foreground text-center">
                  {{ $t('components.WalletConnect.otherWallet') }}
                </span>
                <div class="buttons flex flex-col gap-3">
                  <Button :disabled="!keplr" @click="connectWallet(Wallets.keplr)">
                    <Icon icon="keplr" size="1.25" />
                    <span>Keplr Wallet</span>
                  </Button>
                  <Button :disabled="!leap" @click="connectWallet(Wallets.leap)">
                    <Icon icon="leap" size="1.25" />
                    <span>Leap Wallet</span>
                  </Button>
                  <Button :disabled="!cosmostation" @click="connectWallet(Wallets.cosmostation)">
                    <Icon icon="cosmostation" size="1.25" />
                    <span>Cosmostation Wallet</span>
                  </Button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="addressState">
            <div class="flex flex-col px-8 py-4 pt-12 bg-grey-300 rounded w-80 relative gap-4">
              <div class="flex flex-col text-[white] text-500 font-semibold text-center">
                {{ $t('components.WalletConnect.ctaAddress') }}
              </div>
              <div class="flex flex-col text-grey-100 text-200 font-medium text-center leading-5">
                {{ $t('components.WalletConnect.enterAddress') }}
              </div>
              <input
                v-model="publicAddress"
                class="flex p-4 items-center self-stretch rounded-lg bg-grey-200 outline-none text-100 leading-4 placeholder-grey-100"
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
                <ConnectButton
                  class="justify-center"
                  @click="
                    isAddressOnlyConnection = false;
                  "
                >
                  {{ $t('components.WalletConnect.cancel') }}</ConnectButton
                >
              </div>
              <span class="text-grey-100 text-100 text-center leading-4">
                {{ $t('components.WalletConnect.publicAddressDisclaimer') }}
              </span>
            </div>
          </template>

          <!-- Normal signed in account display -->
          <template v-else-if="connectedState">
            <div class="flex align-center items-stretch cursor-pointer">
              <div class="bg-gradient w-10 h-10 rounded-full mr-3"></div>
              <div class="flex flex-col justify-around">
                <div class="text-light text-200">{{ shorten(address) }}</div>

                <div class="text-100 text-grey-100">
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
                  <div class="bg-gradient w-10 h-10 rounded-full mr-3"></div>
                  <div class="flex flex-col justify-around">
                    <div class="text-light text-300">{{ shorten(address) }}</div>
                  </div>
                </div>
                <div class="text-200 text-grey-100 pt-6 pb-2">{{ $t('components.WalletConnect.balance') }}</div>
                <div class="text-300 text-light">
                  <UserBalance :address="address" /> {{ chainConfig.stakeCurrency.coinDenom }}
                </div>
                <div class="buttons">
                  <ConnectButton
                    class="my-4 justify-center"
                    @click="
                      signOut();
                    "
                  >
                    {{ $t('components.WalletConnect.disconnect') }}</ConnectButton
                  >
                </div>
              </div>
            </div>
          </template>

          <!-- Connection in progress -->
          <template v-else-if="connectingState">
            <div
              class="flex flex-col gap-4 items-center"
            >
              <div class="text-xl font-bold text-center">
                {{ $t('components.WalletConnect.connecting') }}
              </div>
              <div class="text-muted-foreground text-lg">{{ $t('components.WalletConnect.wait') }}</div>
              <div class="buttons">
                <ConnectButton
                  @click="
                    () => {
                      cancelConnect();
                    }
                  "
                >
                  {{ $t('ui.actions.cancel') }}</ConnectButton
                >
              </div>

              <div v-if="isSlowConnecting">
                <a
                  :href="getWalletHelp(chosenWallet)"
                  target="_blank"
                  class="text-100 flex my-2 justify-center items-center"
                >{{ chosenWallet }} {{ $t('components.WalletConnect.trouble') }}
                  <Icon icon="link" class="ml-2" />
                </a>
              </div>
            </div>
          </template>

          <!-- Connection failed -->
          <template v-if="errorState">
            <div
              class="flex flex-col gap-4 items-center"
            >
              <div class="flex flex-col text-[white] text-400 font-semibold text-center mt-4">
                {{ $t('components.WalletConnect.failed') }}
              </div>
              <div class="text-200 text-grey-100 my-4 text-center">
                {{ $t('components.WalletConnect.failedSub') }}
              </div>
              <div class="buttons">
                <ConnectButton
                  class="my-4 justify-center"
                  @click="
                    () => {
                      connectWallet(chosenWallet);
                    }
                  "
                >
                  {{ $t('components.WalletConnect.retry') }}</ConnectButton
                >
                <ConnectButton
                  class="my-4 justify-center"
                  @click="
                    () => {
                      cancelConnect();
                    }
                  "
                >
                  {{ $t('ui.actions.done') }}</ConnectButton
                >
              </div>

              <div>
                <a
                  :href="getWalletHelp(chosenWallet)"
                  target="_blank"
                  class="text-100 flex my-2 justify-center items-center"
                >{{ chosenWallet }} {{ $t('components.WalletConnect.trouble') }}
                  <Icon icon="link" class="ml-2" />
                </a>
              </div>
            </div>
          </template>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>
