<script lang="ts" setup>
import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTitle,
  ResponsiveDialogContent,
} from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { useFractionalDigits } from '@/composables/useFractionalDigits';
import { useTxDialog } from '@/composables/useTxDialog';
import { useUnfollowUser } from '@/composables/useUnfollowUser';
import { useConfigStore } from '@/stores/useConfigStore';
import { showBroadcastingToast } from '@/utility/toast';

import DialogDescription from '../ui/dialog/DialogDescription.vue';
import UserAvatarUsername from '../users/UserAvatarUsername.vue';

const { unfollowUser, txError, txSuccess } = useUnfollowUser();

const isBalanceInputValid = ref(false);
const {
  isShown,
  inputPhotonModel,
  popupState: unfollow,
  handleClose,
} = useTxDialog<string>('unfollow', txSuccess, txError);
const configStore = useConfigStore();
const fractionalDigits = useFractionalDigits();
const amountAtomics = computed(() =>
  configStore.config.defaultAmountEnabled
    ? configStore.config.defaultAmountAtomics
    : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics,
);

const canSubmit = computed(() => isBalanceInputValid.value);

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}

async function handleSubmit() {
  if (!canSubmit.value || !unfollow.value) {
    return;
  }
  const userAddress = ref(unfollow.value);
  handleClose();
  const toastId = showBroadcastingToast('Unfollow');

  try {
    await unfollowUser({ userAddress, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <Dialog v-if="isShown" open @update:open="handleClose">
    <ResponsiveDialogContent>
      <DialogTitle>{{ $t('components.PopupTitles.unfollow') }}</DialogTitle>
      <DialogDescription>
        <UserAvatarUsername :user-address="unfollow" />
      </DialogDescription>

      <!-- Transaction Form -->
      <div class="flex flex-col w-full gap-4">
        <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
        <Button class="w-full xl:inline hidden" :disabled="!isBalanceInputValid" @click="handleSubmit">
          {{ $t('components.Button.submit') }}
        </Button>
      </div>
    </ResponsiveDialogContent>
  </Dialog>
</template>
