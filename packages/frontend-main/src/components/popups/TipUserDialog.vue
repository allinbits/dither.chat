<script lang="ts" setup>
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import PromoteToggle from '@/components/posts/PromoteToggle.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import { useTipUser } from '@/composables/useTipUser';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { showBroadcastingToast } from '@/utility/toast';

import DialogDescription from '../ui/dialog/DialogDescription.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

const { tipUser, txError, txSuccess } = useTipUser();
const {
  isShown,
  popupState: tip,
  handleClose,
} = useTxDialog<string>('tipUser', txSuccess, txError);
const configStore = useConfigStore();
const amountAtomics = computed(() => {
  if (configStore.config.defaultAmountEnabled) {
    return configStore.config.defaultAmountAtomics;
  }

  return configStore.config.regularSendAmountAtomics;
});

// TODO: Verify wallet has enough balance for amountAtomics before allowing submit
const canSubmit = computed(() => {
  return true;
});

async function handleSubmit() {
  if (!canSubmit.value || !tip.value) {
    return;
  }

  const userAddress = ref(tip.value);
  handleClose();
  const toastId = showBroadcastingToast('Tip');

  try {
    await tipUser({ userAddress, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.tipUser') }}</DialogTitle>
      <DialogDescription>
        <UserAvatarUsername :user-address="tip" />
      </DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <PromoteToggle :show-promote-button="false" />
        <Button class="w-full" :disabled="!canSubmit" @click="handleSubmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </ResponsiveDialogContent>
  </Dialog>
</template>
