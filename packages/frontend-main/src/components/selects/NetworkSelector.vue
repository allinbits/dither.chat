<script setup lang="ts">
import type { SelectRootEmits, SelectRootProps } from 'reka-ui';

import { useForwardPropsEmits } from 'reka-ui';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { envConfigs } from '@/env-config';

const props = defineProps<SelectRootProps>();
const emits = defineEmits<SelectRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);

const availableNetworks = Object.keys(envConfigs);
</script>

<template>
  <Select v-bind="forwarded" class="w-32">
    <SelectTrigger>
      <SelectValue placeholder="Select a network" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem v-for="network in availableNetworks" :key="network" :value="network">
          {{ network }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
