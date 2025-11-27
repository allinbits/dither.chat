<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core';
import { checkAccountHandleIsValid } from 'api-main/utility/handle';
import { Loader } from 'lucide-vue-next';
import { ref, unref, watch } from 'vue';
import { toast } from 'vue-sonner';

import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useAccount } from '@/composables/useAccount';
import { useAvailableHandleChecker } from '@/composables/useAvailableHandleChecker';
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
const { data: account, isFetching } = useAccount({ address: wallet.address });
const { registerHandle, txError, txSuccess } = useRegisterHandle();

const handle = ref<string>(account?.value?.handle ?? '');
const error = ref<string>();
const canRegister = ref(false);

const isHandleAvailable = useAvailableHandleChecker();

watch(account, (account) => {
  handle.value = account?.handle ?? '';
});

watch([txError, txSuccess], ([txError]) => {
  error.value = txError ?? '';
});

debouncedWatch(handle, async (handle) => {
  // Disable register button when handle is empty or when it matches current handle
  if (!handle || handle.length === 0 || handle === unref(account)?.handle) {
    error.value = '';
    canRegister.value = false;
    return;
  }

  try {
    // Check handle format and after make sure it's available
    checkAccountHandleIsValid(handle);
    error.value = await isHandleAvailable(handle) ? '' : 'This handle is not available';
  } catch (e) {
    error.value = (e as Error).message;
  }

  canRegister.value = error.value === '';
}, { debounce: 1000 });

function onKeydownHandle() {
  // Disable register button on key, handle check will enable the button back when handle is valid
  canRegister.value = false;
}

async function onClickRegister() {
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
        <div v-else class="flex flex-col p-4 border-b">
          <div class="flex gap-2 px-8">
            <div class="flex h-[40px] items-center">
              <label class="text-sm font-semibold select-none" for="handler">@</label>
            </div>

            <div class="flex flex-col gap-2 flex-1">
              <div class="flex gap-2 flex-1">
                <Input id="handle" v-model="handle" class="flex-1" @keydown="onKeydownHandle" />
                <Button size="sm" class="decoration-2" variant="outline" :disabled="!canRegister" @click="onClickRegister">
                  <span class="grow">{{ $t('components.Settings.accountHandleRegister') }}</span>
                </Button>
              </div>
              <p v-if="error" class="text-red-500 text-xs w-full">
                {{ error }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
