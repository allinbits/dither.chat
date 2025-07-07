<script lang="ts" setup>

import { ref, watch } from 'vue';

import { useWallet } from '@/composables/useWallet';

import { Button } from '@/components/ui/button';
import {
    PopoverContent,
} from '@/components/ui/popover';

const { toggleSessionMode, sessionSigner } = useWallet();
const isToggled = ref(false);

watch(() => sessionSigner.value, async () => {
    if (!sessionSigner.value) {
        return;
    }

    const result = await sessionSigner.value.hasAuthzGrant();
    isToggled.value = !!result;
});

const { signOut } = useWallet();

</script>

<template>
  <PopoverContent>
    <div class="flex flex-col gap-4">
      <Button
        class="justify-center"
        @click="
          toggleSessionMode();
        "
      >
        {{ $t(isToggled ? 'components.WalletConnect.singleClickDisable' : 'components.WalletConnect.singleClickEnable') }}
      </Button>
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
