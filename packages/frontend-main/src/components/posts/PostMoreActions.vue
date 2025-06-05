<script setup lang="ts">
import type { Post } from 'api-main/types/feed';

import { useClipboard } from '@vueuse/core';
import { Ellipsis, Link2 } from 'lucide-vue-next';

import Button from '../ui/button/Button.vue';
import Icon from '../ui/icon/Icon.vue';

import Popover from '@/components/ui/popover/Popover.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import { cn } from '@/utility';

const { post } = defineProps<{ post: Post }>();

const { copy, copied } = useClipboard({ source: post.hash, copiedDuring: 3000 });

const buttonClass = 'flex flex-row items-center justify-start gap-2 w-full';
const buttonLabelClass = 'text-sm font-semibold';
</script>

<template>
  <Popover>
    <PopoverTrigger @click.stop>
      <Ellipsis class="size-5" color="#A2A2A9" />
    </PopoverTrigger>

    <PopoverContent class="p-2">
      <Button @click="copy" size="sm" :class="cn(buttonClass, 'justify-between')" variant="outline">
        <div class="flex flex-row items-center gap-2">
          <Link2 class="size-5" />
          <span :class="buttonLabelClass">{{ $t('components.Button.copyLink') }}</span>
        </div>
        <span v-if="copied" class="text-xs font-normal">{{ $t('feedbacks.copied') }}</span>
      </Button>

      <Button @click="() => { }" size="sm" :class="buttonClass" variant="outline">
        <div class="flex flex-row items-center gap-2">
          <Icon icon="mintscan" :size="1.25" />
          <span :class="buttonLabelClass">{{ $t('components.Button.mintscan') }}</span>
        </div>
      </Button>

      <Button @click="() => { }" size="sm" :class="buttonClass" variant="outline">
        <div class="flex flex-row items-center gap-2">
          <Icon icon="pingpub" :size="1.25" />
          <span :class="buttonLabelClass">{{ $t('components.Button.pingpub') }}</span>
        </div>
      </Button>

    </PopoverContent>
  </Popover>
</template>
