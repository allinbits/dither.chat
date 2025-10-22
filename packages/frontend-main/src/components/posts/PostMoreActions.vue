<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { useClipboard } from '@vueuse/core';
import { Ellipsis, Link2 } from 'lucide-vue-next';

import Popover from '@/components/ui/popover/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { cn } from '@/utility';

import Button from '../ui/button/Button.vue';
import Icon from '../ui/icon/Icon.vue';

const { post } = defineProps<{ post: Post }>();
const configStore = useConfigStore();

const postUrl = `${window.location.origin}/post/${post.hash}`;
const { copy, copied } = useClipboard({ source: postUrl, copiedDuring: 3000 });

const buttonClass = 'flex flex-row items-center justify-start gap-2 w-full';
const buttonLabelClass = 'text-sm font-semibold';

function gotoPingpub() {
  const explorerUrl = configStore.envConfig.explorerUrl;
  window.open(`${explorerUrl}/${post.hash}`, '_blank');
}

function gotoMintscan() {
  const mintScanURL = 'https://www.mintscan.io/atomone/tx/';
  window.open(`${mintScanURL}${post.hash}`, '_blank');
}
</script>

<template>
  <Popover>
    <PopoverTrigger class="p-2 rounded-full hover:bg-accent active:bg-accent transition-colors" @click.stop>
      <Ellipsis class="size-5" color="#A2A2A9" />
    </PopoverTrigger>

    <PopoverContent class="p-2">
      <Button size="sm" :class="cn(buttonClass, 'justify-between')" variant="ghost" @click="copy(postUrl)">
        <div class="flex flex-row items-center gap-2">
          <Link2 class="size-5" />
          <span :class="buttonLabelClass">{{ $t('components.Button.copyLink') }}</span>
        </div>
        <span v-if="copied" class="text-xs font-normal">{{ $t('feedbacks.copied') }}</span>
      </Button>

      <Button size="sm" :class="buttonClass" variant="ghost" @click="gotoMintscan">
        <div class="flex flex-row items-center gap-2">
          <Icon icon="mintscan" :size="1.25" />
          <span :class="buttonLabelClass">{{ $t('components.Button.mintscan') }}</span>
        </div>
      </Button>

      <Button size="sm" :class="buttonClass" variant="ghost" @click="gotoPingpub">
        <div class="flex flex-row items-center gap-2">
          <Icon icon="pingpub" :size="1.25" />
          <span :class="buttonLabelClass">{{ $t('components.Button.pingpub') }}</span>
        </div>
      </Button>
    </PopoverContent>
  </Popover>
</template>
