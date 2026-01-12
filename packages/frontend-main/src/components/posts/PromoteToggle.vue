<script lang="ts" setup>
import { Decimal } from '@cosmjs/math';
import { Info, Rocket } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button';
import { ResponsivePopoverDialog } from '@/components/ui/popover';
import Switch from '@/components/ui/switch/Switch.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { fractionalDigits } from '@/utility/atomics';

defineProps<{
  showPromoteButton?: boolean;
}>();

const isPromoted = defineModel<boolean>({ default: false });

const isPopoverOpen = ref(false);
const isLearnMoreOpen = ref(false);

const configStore = useConfigStore();

// Get send amounts from config
const regularSendAtomics = computed(() => {
  return configStore.config.defaultAmountEnabled
    ? configStore.config.defaultAmountAtomics
    : configStore.config.regularSendAmountAtomics;
});

const promotionSendAtomics = computed(() => configStore.config.promotionSendAmountAtomics);

// Display values
const regularSendDisplay = computed(() =>
  Decimal.fromAtomics(regularSendAtomics.value, fractionalDigits).toString(),
);

const promotionSendDisplay = computed(() =>
  Decimal.fromAtomics(promotionSendAtomics.value, fractionalDigits).toString(),
);

const currentAmountDisplay = computed(() => {
  return isPromoted.value ? promotionSendDisplay.value : regularSendDisplay.value;
});
</script>

<template>
  <div class="flex flex-col w-full gap-2">
    <!-- Send Amount Info -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-1 text-xs">
        <span class="text-muted-foreground">
          {{ $t('components.PromoteToggle.willSend') }}
          <span class="font-semibold text-foreground">{{ currentAmountDisplay }} PHOTON</span>
        </span>

        <!-- Learn More Button -->
        <ResponsivePopoverDialog v-model:open="isLearnMoreOpen" modal>
          <template #trigger>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              class="h-4 w-4 p-0"
              :title="$t('components.PromoteToggle.learnMore')"
            >
              <Info class="size-3 text-muted-foreground hover:text-foreground" />
            </Button>
          </template>
          <div class="flex flex-col gap-2">
            <h4 class="font-semibold">
              {{ $t('components.PromoteToggle.sendExplainTitle') }}
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ $t('components.PromoteToggle.sendExplainDescription') }}
            </p>
          </div>
        </ResponsivePopoverDialog>
      </div>

      <!-- Promote Button (bottom right) -->
      <ResponsivePopoverDialog v-if="showPromoteButton" v-model:open="isPopoverOpen" modal>
        <template #trigger>
          <Button
            variant="outline"
            size="sm"
            type="button"
            class="gap-1.5 relative h-7 text-xs px-2"
            :class="{ 'border-primary text-primary hover:bg-primary/5': isPromoted }"
          >
            <Rocket class="size-3.5" />
            {{ $t('components.PromoteToggle.promoteButton') }}
            <span
              v-if="isPromoted"
              class="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
            />
          </Button>
        </template>
        <div class="flex flex-col gap-4">
          <div class="flex items-start gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
              <Rocket class="size-5 text-primary" />
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <h4 class="font-semibold">
                {{ $t('components.PromoteToggle.popoverTitle') }}
              </h4>
              <p class="text-sm text-muted-foreground">
                {{ $t('components.PromoteToggle.popoverDescription', { amount: promotionSendDisplay }) }}
              </p>
            </div>
          </div>

          <!-- Toggle inside popover -->
          <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div class="flex flex-col gap-1">
              <span class="text-sm font-medium">{{ $t('components.PromoteToggle.enablePromotion') }}</span>
              <span class="text-xs text-muted-foreground">{{ promotionSendDisplay }} PHOTON</span>
            </div>
            <Switch id="promote-switch" v-model="isPromoted" />
          </div>
        </div>
      </ResponsivePopoverDialog>
    </div>
  </div>
</template>
