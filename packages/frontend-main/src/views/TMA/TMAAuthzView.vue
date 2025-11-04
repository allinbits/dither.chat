<script setup lang="ts">
import { CheckCircle, Loader } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';

import Button from '@/components/ui/button/Button.vue';
import { useAuthzGrant, useAuthzGrants, useAuthzRevoke } from '@/composables/authz';
import MainLayout from '@/layouts/MainLayout.vue';
import { useConfigStore } from '@/stores/useConfigStore';
import ViewHeading from '@/views/ViewHeading.vue';

const { t } = useI18n();
const configStore = useConfigStore();
const granteeAddress = configStore.envConfig.authzGrantee;

const { isLoading, hasActiveGrant } = useAuthzGrants(granteeAddress);

const grantMutation = useAuthzGrant();
const revokeMutation = useAuthzRevoke();

const isProcessing = computed(() => grantMutation.isPending.value || revokeMutation.isPending.value);

function handleGrant() {
  grantMutation.mutate(granteeAddress, {
    onSuccess: (result) => {
      if (result.broadcast) {
        toast.success(t('components.Authz.grantSuccess'));
      } else {
        toast.error(result.msg || t('components.Authz.grantFailed'));
      }
    },
    onError: (error) => {
      console.error('Error granting authorization:', error);
      toast.error(`${t('components.Authz.grantFailed')}: ${error}`);
    },
  });
}

function handleRevoke() {
  revokeMutation.mutate(granteeAddress, {
    onSuccess: (result) => {
      if (result.broadcast) {
        toast.success(t('components.Authz.revokeSuccess'));
      } else {
        toast.error(result.msg || t('components.Authz.revokeFailed'));
      }
    },
    onError: (error) => {
      console.error('Error revoking authorization:', error);
      toast.error(`${t('components.Authz.revokeFailed')}: ${error}`);
    },
  });
}
</script>

<template>
  <MainLayout>
    <div class="flex flex-col">
      <ViewHeading :title="$t('components.Authz.title')" />
      <div class="flex flex-col text-pretty">
        <!-- Summary Section -->
        <div class="flex flex-col border-b">
          <span class="pt-4 pl-4 font-bold">{{ $t('components.Settings.whatIsIt') }}</span>
          <p class="p-4 text-sm">
            {{ $t('components.Authz.summary') }}
          </p>
        </div>

        <!-- Grant/Revoke Actions -->
        <div class="flex flex-col p-4">
          <template v-if="isLoading">
            <div class="flex items-center justify-center pt-4">
              <Loader class="animate-spin" :size="24" />
            </div>
          </template>

          <template v-else-if="hasActiveGrant && !isProcessing">
            <!-- Active Grant Banner -->
            <div class="flex items-center gap-3 p-4 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle :size="20" class="text-green-600 dark:text-green-400 flex-shrink-0" />
              <span class="text-sm font-medium text-green-900 dark:text-green-100">
                {{ $t('components.Authz.activeBanner') }}
              </span>
            </div>

            <!-- Revoke Button -->
            <Button
              size="sm"
              class="w-full decoration-2"
              variant="destructive"
              @click="handleRevoke"
            >
              <span class="grow">{{ $t('components.Authz.revokeButton') }}</span>
            </Button>
          </template>

          <template v-else-if="!hasActiveGrant && !isProcessing">
            <!-- Grant Button -->
            <Button
              size="sm"
              class="w-full decoration-2"
              variant="outline"
              @click="handleGrant"
            >
              <span class="grow">{{ $t('components.Authz.grantButton') }}</span>
            </Button>
          </template>

          <template v-else-if="isProcessing">
            <!-- Processing State -->
            <div class="flex items-center justify-center pt-4">
              <Loader class="animate-spin" :size="24" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
