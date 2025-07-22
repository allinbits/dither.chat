<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { ref } from 'vue';
import { Decimal } from '@cosmjs/math';
import { Flag, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-vue-next';

import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { useDislikePost } from '@/composables/useDislikePost';
import { useFlagPost } from '@/composables/useFlagPost';
import { useLikePost } from '@/composables/useLikePost';
import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import Popover from '../ui/popover/Popover.vue';
import PopoverContent from '../ui/popover/PopoverContent.vue';
import PopoverTrigger from '../ui/popover/PopoverTrigger.vue';

import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { cn } from '@/utility';
import { fractionalDigits } from '@/utility/atomics';
import { formatCompactAtomics, formatCompactNumber } from '@/utility/text';

const props = defineProps<{ post: Post }>();
const buttonWrapperClass = 'flex items-center flex-1 min-w-[84px]';
const buttonClass = 'flex flex-row items-center gap-1 p-2 rounded-full hover:bg-accent active:bg-accent transition-colors';
const amountTextClass = 'text-[#A2A2A9] text-xs font-medium hover:underline active:underline transition-colors';
const amountPopoverContentClass = 'py-2 px-3 size-fit';
const fullAmountTextClass = 'text-sm ';

const wallet = useWallet();
const popups = usePopups();
const walletDialogStore = useWalletDialogStore();
const configStore = useConfigStore();
const { isDefaultAmountInvalid } = useDefaultAmount();

const { likePost } = useLikePost();
const { dislikePost } = useDislikePost();
const { flagPost } = useFlagPost();

function handleAction(type: keyof PopupState, post: Post) {
    if (wallet.loggedIn.value) {
        popups.show(type, post);
        return;
    }

    walletDialogStore.showDialog(null, () => {
        popups.show(type, post);
    });
}

async function onClickReply() {
    if (isDefaultAmountInvalid.value) {
        popups.show('invalidDefaultAmount', 'none');
    }
    else {
        handleAction('reply', props.post);
    }
}
async function onClickLike() {
    if (isDefaultAmountInvalid.value) {
        popups.show('invalidDefaultAmount', 'none');
    }
    else if (configStore.config.defaultAmountEnabled) {
        await likePost({ post: ref(props.post), amountAtomics: configStore.config.defaultAmountAtomics });
    }
    else {
        handleAction('like', props.post);
    }
}
async function onClickDislike() {
    if (isDefaultAmountInvalid.value) {
        popups.show('invalidDefaultAmount', 'none');
    }
    else if (configStore.config.defaultAmountEnabled) {
        await dislikePost({ post: ref(props.post), amountAtomics: configStore.config.defaultAmountAtomics });
    }
    else {
        handleAction('dislike', props.post);
    }
}
async function onClickFlag() {
    if (isDefaultAmountInvalid.value) {
        popups.show('invalidDefaultAmount', 'none');
    }
    else if (configStore.config.defaultAmountEnabled) {
        await flagPost({ post: ref(props.post), amountAtomics: configStore.config.defaultAmountAtomics });
    }
    else {
        handleAction('flag', props.post);
    }
}

</script>

<template>
  <div :class="cn('flex flex-row items-center justify-between pr-2 flex-wrap')">
    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="onClickReply">
        <MessageCircle class="size-5" color="#A2A2A9" />
      </button>
      <Popover>
        <PopoverTrigger @click.stop >
          <span :class="amountTextClass">{{ formatCompactNumber(post.replies) }}</span>
        </PopoverTrigger>
        <PopoverContent :class="amountPopoverContentClass">
          <span :class="fullAmountTextClass">{{ formatCompactNumber(post.replies) + ' ' + $t('components.PostActions.replies', post.replies ?? 0) }}</span>
        </PopoverContent>
      </Popover>
    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="onClickLike">
        <ThumbsUp class="size-5" color="#A2A2A9" />
      </button>
      <Popover>
        <PopoverTrigger @click.stop >
          <span :class="amountTextClass">{{ formatCompactAtomics(post.likes_burnt, fractionalDigits) }}</span>
        </PopoverTrigger>
        <PopoverContent :class="amountPopoverContentClass">
          <span :class="fullAmountTextClass">{{ Decimal.fromAtomics(post.likes_burnt ?? '0', fractionalDigits).toString() }} PHOTON</span>
        </PopoverContent>
      </Popover>

    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="onClickDislike">
        <ThumbsDown class="size-5 scale-x-[-1]" color="#A2A2A9" />
      </button>
      <Popover>
        <PopoverTrigger @click.stop >
          <span :class="amountTextClass">{{ formatCompactAtomics(post.dislikes_burnt, fractionalDigits) }}</span>
        </PopoverTrigger>
        <PopoverContent :class="amountPopoverContentClass">
          <span :class="fullAmountTextClass">{{ Decimal.fromAtomics(post.dislikes_burnt ?? '0', fractionalDigits).toString() }} PHOTON</span>
        </PopoverContent>
      </Popover>
    </div>

    <div :class="buttonWrapperClass">
      <button :class="buttonClass" @click.stop="onClickFlag">
        <Flag class="size-5" color="#A2A2A9" />
      </button>
      <Popover>
        <PopoverTrigger @click.stop >
          <span :class="amountTextClass">{{ formatCompactAtomics(post.flags_burnt, fractionalDigits) }}</span>
        </PopoverTrigger>
        <PopoverContent :class="amountPopoverContentClass">
          <span :class="fullAmountTextClass">{{ Decimal.fromAtomics(post.flags_burnt ?? '0', fractionalDigits).toString() }} PHOTON</span>
        </PopoverContent>
      </Popover>
    </div>

    <Popover>
      <PopoverTrigger @click.stop class="min-w-[114px] ml-auto text-right">
        <span :class="amountTextClass">{{ formatCompactAtomics(post.quantity, fractionalDigits) }} PHOTON</span>
      </PopoverTrigger>
      <PopoverContent :class="amountPopoverContentClass">
        <span :class="fullAmountTextClass">{{ Decimal.fromAtomics(post.quantity ?? '0', fractionalDigits).toString() }} PHOTON</span>
      </PopoverContent>
    </Popover>
  </div>
</template>
