<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { Ellipsis, FlaskConical, UserPlus } from 'lucide-vue-next';

import { type PopupState, usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import Button from '../ui/button/Button.vue';

import Popover from '@/components/ui/popover/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { shorten } from '@/utility/text';

defineProps<{ post: Post }>();

const buttonClass = 'flex flex-row items-center justify-start gap-2 w-full';
const buttonLabelClass = 'text-sm font-semibold';

const wallet = useWallet();
const popups = usePopups();
const walletDialogStore = useWalletDialogStore();

function handleAction(type: keyof PopupState, userAddress: string) {
    if (wallet.loggedIn.value) {
        popups.show(type, userAddress);
        return;
    }

    walletDialogStore.showDialog(null, () => {
        popups.show(type, userAddress);
    });
}
</script>

<template>
  <Popover>
    <PopoverTrigger @click.stop>
      <Ellipsis class="size-5" color="#A2A2A9" />
    </PopoverTrigger>

    <PopoverContent class="p-2">
      <Button @click="handleAction('follow', post.author)" size="sm" :class=buttonClass variant="ghost">
        <UserPlus class="size-5" />
        <span :class="buttonLabelClass">{{ $t('components.Button.follow') + ' ' + shorten(post.author, 8, 4) }}</span>
      </Button>

      <Button size="sm" :class="buttonClass" variant="ghost">
        <FlaskConical class="size-5" />
        <span :class="buttonLabelClass">Do something</span>
      </Button>

      <Button size="sm" :class="buttonClass" variant="ghost">
        <FlaskConical class="size-5" />
        <span :class="buttonLabelClass">Do something</span>
      </Button>
    </PopoverContent>
  </Popover>
</template>
