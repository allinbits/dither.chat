<script setup lang="ts">
import { computed } from 'vue';
import { TonConnectButton, useTonWallet } from '~/tonconnect';
import AppDisplayData, { type DisplayDataRow } from '~/components/AppDisplayData.vue';
import AppLink from '~/components/AppLink.vue';
import AppPage from '~/components/AppPage.vue';
import { Card, CardContent, CardHeader } from '~/components/ui';
import { WalletIcon, LinkIcon } from 'lucide-vue-next';

const { wallet } = useTonWallet();

const walletExtended = computed(() => {
  return wallet.value && 'imageUrl' in wallet.value ? wallet.value : null;
});

const rows = computed<DisplayDataRow[]>(() => {
  return wallet.value ? [
    { title: 'Address', value: wallet.value.account.address },
    { title: 'Chain', value: wallet.value.account.chain },
    { title: 'Public Key', value: wallet.value.account.publicKey },
  ] : [];
});
</script>

<template>
  <AppPage title="TON Connect">
    <template #title>
      <div class="flex items-center gap-2">
        <WalletIcon class="w-5 h-5" />
        TON Connect
      </div>
    </template>
    
    <div class="w-full space-y-6">
      <!-- Connection Status -->
      <Card v-if="!wallet">
        <CardContent class="p-6 text-center">
          <WalletIcon class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 class="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p class="text-muted-foreground mb-4">
            To display the data related to the TON Connect, it is required to connect your wallet.
          </p>
          <div class="flex justify-center">
            <TonConnectButton />
          </div>
        </CardContent>
      </Card>

      <!-- Connected Wallet Info -->
      <template v-else>
        <Card v-if="walletExtended">
          <CardHeader>
            <div class="flex items-center gap-4">
              <img 
                :src="walletExtended.imageUrl" 
                alt="Provider logo"
                class="w-12 h-12 rounded-lg"
              />
              <div>
                <h3 class="text-lg font-semibold">{{ walletExtended.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ walletExtended.appName }}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AppLink :to="walletExtended.aboutUrl" class="inline-flex items-center gap-2">
              <LinkIcon class="w-4 h-4" />
              About connected wallet
            </AppLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold">Wallet Details</h3>
          </CardHeader>
          <CardContent>
            <AppDisplayData :rows />
          </CardContent>
        </Card>
      </template>
    </div>
  </AppPage>
</template>
