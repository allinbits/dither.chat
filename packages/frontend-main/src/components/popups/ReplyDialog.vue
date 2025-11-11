<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { Decimal } from '@cosmjs/math';
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';

import PostMessage from '@/components/posts/PostMessage.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { Textarea } from '@/components/ui/textarea';
import UserAvatar from '@/components/users/UserAvatar.vue';
import Username from '@/components/users/Username.vue';
import { useCreateReply } from '@/composables/useCreateReply';
import { useTxDialog } from '@/composables/useTxDialog';
import { useConfigStore } from '@/stores/useConfigStore';
import { fractionalDigits } from '@/utility/atomics';
import { showBroadcastingToast } from '@/utility/toast';

const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);
const message = ref('');
const isBalanceInputValid = ref(false);
const configStore = useConfigStore();

const { createReply, txError, txSuccess } = useCreateReply();
const {
  isShown,
  inputPhotonModel,
  popupState: reply,
  handleClose,
} = useTxDialog<Post>('reply', txSuccess, txError);
const amountAtomics = computed(() => configStore.config.defaultAmountEnabled ? configStore.config.defaultAmountAtomics : Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics);
const canSubmit = computed(() => configStore.config.defaultAmountEnabled || (isBalanceInputValid.value && message.value.length > 0));

async function handleSubmit() {
  if (!canSubmit.value || !reply.value) {
    return;
  }

  const parentPost = ref(reply.value);
  handleClose();
  const toastId = showBroadcastingToast('Reply');

  try {
    await createReply({ parentPost, message: message.value, amountAtomics: amountAtomics.value });
  } finally {
    toast.dismiss(toastId);
  }
}

function handleInputValidity(value: boolean) {
  isBalanceInputValid.value = value;
}
</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="handleClose">
      <ResponsiveDialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.reply') }}</DialogTitle>

        <div class="flex flex-row gap-3 border-b pb-3">
          <UserAvatar :user-address="reply.author" />
          <div class="flex flex-col w-full gap-3">
            <div class="flex flex-row gap-3 pt-2.5">
              <Username :user-address="reply.author" />
              <PrettyTimestamp :timestamp="new Date(reply.timestamp)" />
            </div>

            <div class="max-w-[calc(100dvw-6rem)] overflow-x-auto">
              <PostMessage :message="reply.message" />
            </div>
          </div>
        </div>

        <Textarea v-model="message" :placeholder="$t('placeholders.reply')" :maxlength="MAX_CHARS" />

        <!-- Transaction Form -->
        <div class="flex flex-col w-full gap-4">
          <InputPhoton v-if="!configStore.config.defaultAmountEnabled" v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
          <span v-if="txError" class="text-red-500 text-xs">{{ txError }}</span>
          <Button class="w-full" :disabled="!canSubmit" @click="handleSubmit">
            {{ $t('components.Button.submit') }}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </Dialog>
  </div>
</template>
