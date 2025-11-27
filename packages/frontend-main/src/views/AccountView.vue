<script setup lang="ts">
import { Loader } from 'lucide-vue-next';
import { ref, watch } from 'vue';

import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useAccount } from '@/composables/useAccount';
import { usePopups } from '@/composables/usePopups';
import { useRegisterHandle } from '@/composables/useRegisterHandle';
import { useWallet } from '@/composables/useWallet';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { showBroadcastingToast } from '@/utility/toast';
import HeaderBack from '@/views/ViewHeading.vue';

const wallet = useWallet();
const popups = usePopups();
const configStore = useConfigStore();
const { data: account, isFetching } = useAccount({ address: wallet.address.value });
const { registerHandle } = useRegisterHandle();

const handle = ref<string>(account?.value?.handle);

watch(account, (account) => {
  handle.value = account.handle;
});

async function onClickRegister() {
  // TODOs:
  // - Handle registration click (check handle is different than current one)
  // - Check handle format and show error
  // - Check if handle is available before triggering registration

  if (configStore.config.defaultAmountEnabled) {
    const toastId = showBroadcastingToast('Register Handle');
    try {
      await registerHandle({ handle: handle.value, amountAtomics: configStore.config.defaultAmountAtomics });
    } finally {
      toast.dismiss(toastId);
    }
  } else {
    popups.show('registerHandle', handle.value);
  }
}
</script>

<template>
  <MainLayout>
    <div class="flex flex-col flex-1">
      <HeaderBack :title="$t('components.Headings.account')" />

      <div class="flex flex-col text-pretty">
        <div class="flex flex-col">
          <span class="pt-4 pl-4 font-bold">{{ $t(`components.Settings.accountHandle`) }}</span>
          <p class="p-4 text-sm">
            {{ $t(`components.Settings.accountHandleSummary`) }}
          </p>
        </div>

        <div v-if="isFetching" class="flex items-center justify-center p-4 border-b">
          <Loader class="animate-spin " />
        </div>
        <div v-else class="flex flex-col p-4 gap-4 border-b">
          <div class="flex gap-2 px-8">
            <div class="flex h-[40px] items-center">
              <label class="text-sm font-semibold select-none" for="handler">@</label>
            </div>

            <Input id="handle" v-model.trim="handle" class="flex-1" />

            <Button size="sm" class="decoration-2" variant="outline" @click="onClickRegister">
              <span class="grow">{{ $t('components.Settings.accountHandleRegister') }}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
