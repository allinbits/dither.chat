<script lang="ts" setup>
import type { UserAvatarUsernameProps } from './UserAvatarUsername.vue';

import { computed } from 'vue';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAddressHandle } from '@/features/social/composables/useAddressHandle';
import { providers } from '@/features/social/providers/registry';
import { cn } from '@/utility';
import { shorten } from '@/utility/text';

const props = defineProps<UserAvatarUsernameProps>();

const address = computed(() => props.userAddress ?? '');
const { handle, platform } = useAddressHandle(address);

const provider = computed(() => {
  if (!platform.value) return null;
  return providers.find(p => p.id === platform.value) ?? null;
});

const display = computed(() => handle.value ? `@${handle.value}` : shorten(props.userAddress || '...............', 8, 4));
</script>

<template>
  <div
    :class="cn(
      size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base',
      !disabled && 'active:underline hover:underline decoration-2',
      'font-semibold inline-flex items-center gap-1.5',
    )"
  >
    <slot :display="display" :handle="handle" :platform="platform" :provider="provider">
      <span>{{ display }}</span>
      <TooltipProvider v-if="provider && handle" :delay-duration="500">
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="transform translate-y-[0.06rem] inline-flex items-center justify-center rounded border border-border/70 bg-muted/60 text-muted-foreground py-0.5 px-1" tabindex="0" :aria-label="`${provider.label} provider`">
              <component :is="provider.icon" class="size-3 shrink-0" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <span>{{ `Identity verified through ${provider.label}` }}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </slot>
  </div>
</template>
