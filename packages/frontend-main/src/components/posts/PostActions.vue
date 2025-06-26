<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { useMediaQuery } from '@vueuse/core';
import { Flag, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-vue-next';

import { useChain } from '@/composables/useChain';
import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { cn } from '@/utility';
import { formatCompactNumber } from '@/utility/text';

defineProps<{ post: Post }>();
const isXs = useMediaQuery('(max-width: 414px)');
const buttonWrapperClass = 'flex-1 min-w-[68px]';
const buttonClass = 'flex flex-row items-center gap-1 p-2 rounded-full hover:bg-accent active:bg-accent transition-colors';
const buttonLabelClass = 'text-[#A2A2A9] text-xs font-medium';

const wallet = useWallet();
const popups = usePopups();
const walletDialogStore = useWalletDialogStore();
const { getAmountFromAtomic } = useChain();

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
  <div :class="cn('flex flex-row items-center justify-between pr-2', isXs && 'flex-wrap pb-2')">
    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="handleAction('reply', post)">
        <MessageCircle class="size-5" color="#A2A2A9" />
        <span :class="buttonLabelClass">{{ formatCompactNumber(post.replies) }}</span>
      </button>
    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="handleAction('like', post)">
        <ThumbsUp class="size-5" color="#A2A2A9" />
        <span :class="buttonLabelClass">{{ formatCompactNumber(post.likes) }}</span>
      </button>
    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="handleAction('dislike', post)">
        <ThumbsDown class="size-5 scale-x-[-1]" color="#A2A2A9" />
        <span :class="buttonLabelClass">{{ formatCompactNumber(post.dislikes) }}</span>
      </button>
    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="handleAction('flag', post)">
        <Flag class="size-5" color="#A2A2A9" />
      </button>
    </div>

    <div class="flex flex-wrap justify-end gap-x-1 ml-auto text-xs text-right  text-neutral-400">
      <span class="w-[64px]">{{ getAmountFromAtomic(post.quantity.toString(), 'uphoton') + ' ' }}</span>
      <span>PHOTON</span>
    </div>
  </div>
</template>
