<script setup lang="ts">
import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import { debouncedWatch } from '@vueuse/core';
import { Decimal } from '@cosmjs/math';

import InputPhoton from '@/components/ui/input/InputPhoton.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { fractionalDigits } from '@/utility/atomics';
import ViewHeading from '@/views/ViewHeading.vue';

const configStore = useConfigStore();
const inputPhotonModel = ref(Decimal.fromAtomics(configStore.config.defaultAmountAtomics, fractionalDigits).toFloatApproximation());
const hasEnoughBalance = ref(false);

function handleInputValidity(value: boolean) {
    hasEnoughBalance.value = value;
}

debouncedWatch(configStore.config, () => {
    toast.success('Success', {
        description: 'Config automatically updated',
        duration: 2000,
    });
}, { debounce: 1000 });

watch(
    inputPhotonModel,
    (newVal) => {
        if (newVal) {
            configStore.config.defaultAmountAtomics = Decimal.fromUserInput(newVal.toString(), fractionalDigits).atomics;
        }
    },
);
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <ViewHeading :title="$t(`components.Settings.defaultAmount`)" />

      <div class="flex flex-col text-pretty">
        <div class="flex flex-col border-b">
          <span class="pt-4 pl-4 font-bold">{{ $t(`components.Settings.whatIsIt`) }}</span>
          <p class="p-4 text-sm whitespace-pre-line">{{ $t(`components.Settings.defaultAmountSummary`) }}</p>
        </div>

        <div class="flex flex-col p-4 gap-4">
          <div class="flex  gap-4">
            <div class="flex w-[110px] h-[40px] items-center cursor-pointer">
              <Switch id="defaultAmountEnabled" v-model="configStore.config.defaultAmountEnabled"/>
              <label
                class="text-sm pl-3 font-semibold select-none cursor-pointer"
                for="defaultAmountEnabled"
              >
                {{ configStore.config.defaultAmountEnabled ? $t(`components.Settings.enabled`) : $t(`components.Settings.disabled`) }}
              </label>
            </div>

            <InputPhoton v-model="inputPhotonModel" @on-validity-change="handleInputValidity"   class="flex-1" />
          </div>

          <span class="text-yellow-600 text-xs" v-if="!!configStore.config.defaultAmountEnabled && !hasEnoughBalance && !!inputPhotonModel">
            {{
              !hasEnoughBalance
                && $t('components.Settings.defaultAmountWarning')
            }}
          </span>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
