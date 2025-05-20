<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-vue-next';

import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import SharePostPopover from '../popups/SharePostPopover.vue';

import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

defineProps<{ post: Post }>();

const buttonClass = 'flex flex-row items-center gap-1';
const buttonLabelClass = 'text-[#A2A2A9] text-xs font-medium';

const wallet = useWallet();
const popups = usePopups();
const walletDialogStore = useWalletDialogStore();

function handleAction(type: keyof PopupState, post: Post) {
    if (wallet.loggedIn.value) {
        popups.show(type, post);
        return;
    }

    walletDialogStore.showDialog(() => {
        popups.show(type, post);
    });
}

</script>

<template>
  <div class="flex flex-row items-center justify-between">
    <button :class="buttonClass" @click.stop="handleAction('reply', post)">
      <MessageCircle class="size-5" color="#A2A2A9" />
      <span :class="buttonLabelClass">{{ post.replies }}</span>
    </button>
    <button :class="buttonClass" @click.stop="handleAction('like', post)">
      <ThumbsUp class="size-5" color="#A2A2A9" />
      <span :class="buttonLabelClass">{{ post.likes }}</span>
    </button>
    <button :class="buttonClass" @click.stop="handleAction('dislike', post)">
      <ThumbsDown class="size-5 scale-x-[-1]" color="#A2A2A9" />
      <span :class="buttonLabelClass">{{ post.dislikes }}</span>
    </button>
    <SharePostPopover :post="post"/>
  </div>
</template>
