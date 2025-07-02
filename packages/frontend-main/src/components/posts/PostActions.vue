<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { useMediaQuery } from '@vueuse/core';
import { Flag, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-vue-next';

import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { cn } from '@/utility';
import { formatAmount, formatCompactNumber } from '@/utility/text';

defineProps<{ post: Post }>();
const isSmallScreen = useMediaQuery('(max-width: 422px)');
const buttonWrapperClass = 'flex-1 min-w-[70px]';
const buttonClass = 'flex flex-row items-center gap-1 p-2 rounded-full hover:bg-accent active:bg-accent transition-[background-color]';
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
  <div :class="cn('flex flex-row items-center justify-between pr-2', isSmallScreen && 'flex-wrap pb-2')">
    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="handleAction('reply', post)">
        <MessageCircle class="size-5" color="#A2A2A9" />
        <span :class="buttonLabelClass">{{ formatCompactNumber(post.replies) }}</span>
      </button>
    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="handleAction('like', post)">
        <ThumbsUp class="size-5" color="#A2A2A9" />
        <span :class="buttonLabelClass">{{ formatCompactNumber(post.likes_burnt) }}</span>
      </button>
    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="handleAction('dislike', post)">
        <ThumbsDown class="size-5 scale-x-[-1]" color="#A2A2A9" />
        <span :class="buttonLabelClass">{{ formatCompactNumber(post.dislikes_burnt) }}</span>
      </button>
    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="handleAction('flag', post)">
        <Flag class="size-5" color="#A2A2A9" />
        <span :class="buttonLabelClass">{{ formatCompactNumber(post.flags_burnt) }}</span>
      </button>
    </div>

    <div class="flex flex-wrap justify-end gap-x-1 ml-auto text-xs text-right  text-neutral-400">
      <span class="w-[64px]">{{ formatAmount(post.quantity, 6) }}</span>
      <span>PHOTON</span>
    </div>
  </div>
</template>
