<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import { Decimal } from '@cosmjs/math';

import { useCreateReply } from '@/composables/useCreateReply';
import { useTxDialog } from '@/composables/useTxDialog';

import PostMessage from '@/components/posts/PostMessage.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import { Textarea } from '@/components/ui/textarea';
import UserAvatar from '@/components/users/UserAvatar.vue';
import Username from '@/components/users/Username.vue';
import { fractionalDigits } from '@/utility/atomics';
import { showBroadcastingToast } from '@/utility/toast';

const isBalanceInputValid = ref(false);
const message = ref('');

const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);

const { createReply, txError, txSuccess } = useCreateReply();

const {
    isShown,
    inputPhotonModel,
    popupState: reply,
    handleClose,
} = useTxDialog<Post>('reply', 'Reply', txSuccess, txError);

async function handleSumbit() {
    if (!canSubmit.value || !reply.value) {
        return;
    }

    const parentPost = ref(reply.value);
    handleClose();
    const toastId = showBroadcastingToast('Reply');

    try {
        await createReply({ parentPost, message: message.value, amountAtomics: Decimal.fromUserInput(inputPhotonModel.value.toString(), fractionalDigits).atomics });
    }
    finally {
        toast.dismiss(toastId);
    }
}

function handleInputValidity(value: boolean) {
    isBalanceInputValid.value = value;
}

const canSubmit = computed(() => {
    return isBalanceInputValid.value && message.value.length > 0;
});

</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="handleClose" >
      <DialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.reply') }}</DialogTitle>

        <div class="flex flex-row gap-3 border-b pb-3">
          <UserAvatar :userAddress="reply.author" />
          <div class="flex flex-col w-full gap-3">
            <div class="flex flex-row gap-3 pt-2.5">
              <Username :userAddress="reply.author" />
              <PrettyTimestamp :timestamp="new Date(reply.timestamp)" />
            </div>
            <PostMessage :message="reply.message" />
          </div>
        </div>

        <Textarea :placeholder="$t('placeholders.reply')" v-model="message" :maxlength="MAX_CHARS" />

        <!-- Transaction Form -->
        <div class="flex flex-col w-full gap-4">
          <InputPhoton v-model="inputPhotonModel" @on-validity-change="handleInputValidity" />
          <span v-if="txError" class="text-red-500 text-left text-xs">{{ txError }}</span>
          <Button class="w-full" :disabled="!canSubmit" @click="handleSumbit">
            {{ $t('components.Button.submit') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
