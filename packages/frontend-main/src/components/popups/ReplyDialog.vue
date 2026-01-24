<script lang="ts" setup>
import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { toast } from 'vue-sonner';

import PostComposer from '@/components/posts/PostComposer.vue';
import PostMessage from '@/components/posts/PostMessage.vue';
import PrettyTimestamp from '@/components/posts/PrettyTimestamp.vue';
import { Dialog, DialogTitle, ResponsiveDialogContent } from '@/components/ui/dialog';
import UserAvatar from '@/components/users/UserAvatar.vue';
import Username from '@/components/users/Username.vue';
import { useCreateReply } from '@/composables/useCreateReply';
import { useTxDialog } from '@/composables/useTxDialog';
import { showBroadcastingToast } from '@/utility/toast';

const POST_HASH_LEN = 64;
const MAX_CHARS = 512 - ('dither.Reply("", "")'.length + POST_HASH_LEN);
const message = ref('');

const { createReply, txError, txSuccess } = useCreateReply();
const {
  isShown,
  popupState: reply,
  handleClose,
} = useTxDialog<Post>('reply', txSuccess, txError);

function handleCloseWithCleanup() {
  message.value = '';
  handleClose();
}

async function handleSubmit({ message: msgValue, amountAtomics }: { message: string; amountAtomics: string }) {
  if (!reply.value) {
    return;
  }

  const parentPost = ref(reply.value);
  message.value = '';
  handleClose();
  const toastId = showBroadcastingToast('Reply');

  try {
    await createReply({ parentPost, message: msgValue, amountAtomics });
  } finally {
    toast.dismiss(toastId);
  }
}
</script>

<template>
  <div>
    <Dialog v-if="isShown" open @update:open="handleCloseWithCleanup">
      <ResponsiveDialogContent>
        <DialogTitle>{{ $t('components.PopupTitles.reply') }}</DialogTitle>

        <!-- Parent Post Display -->
        <div class="flex flex-row gap-3 border-b pb-3">
          <UserAvatar :user-address="reply.author" />
          <div class="flex flex-col w-full gap-3">
            <div class="flex flex-row gap-3 pt-2.5">
              <Username :user-address="reply.author" />
              <PrettyTimestamp :timestamp="new Date(reply.timestamp)" />
            </div>
            <!-- clamp content width to prevent overflow. 6rem accounts for the left offset -->
            <div class="max-w-[calc(min(512px,100dvw)-6rem)]">
              <PostMessage :message="reply.message" />
            </div>
          </div>
        </div>

        <PostComposer
          v-model="message"
          :max-chars="MAX_CHARS"
          :placeholder="$t('placeholders.reply')"
          @submit="handleSubmit"
        />
      </ResponsiveDialogContent>
    </Dialog>
  </div>
</template>
