<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { Flag, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-vue-next';

import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { formatAmount, formatCompactNumber } from '@/utility/text';

defineProps<{ post: Post }>();

const buttonClass = 'flex flex-1 flex-row items-center gap-1';
const buttonLabelClass = 'text-[#A2A2A9] text-xs font-medium';

const wallet = useWallet();
const popups = usePopups();
const walletDialogStore = useWalletDialogStore();

function handleAction(type: keyof PopupState, post: Post) {
    if (wallet.loggedIn.value) {
        popups.show(type, post);
        return;
    }

    walletDialogStore.showDialog(null, () => {
        popups.show(type, post);
    });
}

</script>

<template>
  <div class="flex flex-wrap flex-row gap-y-3 gap-x-4  items-center justify-between">
    <button :class="buttonClass" @click.stop="handleAction('reply', post)">
      <MessageCircle class="size-5" color="#A2A2A9" />
      <span :class="buttonLabelClass">{{ formatCompactNumber(post.replies) }}</span>
    </button>
    <button :class="buttonClass" @click.stop="handleAction('like', post)">
      <ThumbsUp class="size-5" color="#A2A2A9" />
      <span :class="buttonLabelClass">{{ formatCompactNumber(post.likes_burnt) }}</span>
    </button>
    <button :class="buttonClass" @click.stop="handleAction('dislike', post)">
      <ThumbsDown class="size-5 scale-x-[-1]" color="#A2A2A9" />
      <span :class="buttonLabelClass">{{ formatCompactNumber(post.dislikes_burnt) }}</span>
    </button>
    <button :class="buttonClass" @click.stop="handleAction('flag', post)">
      <Flag class="size-5" color="#A2A2A9" />
      <span :class="buttonLabelClass">{{ formatCompactNumber(post.flags_burnt) }}</span>
    </button>
    <span class="ml-auto text-xs text-right text-neutral-400">{{ formatAmount(post.quantity, 6) }} PHOTON</span>
  </div>
</template>
