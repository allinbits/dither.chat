<script setup lang="ts">
import { useConfirmDialog } from '@/composables/useConfirmDialog';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const { isOpen, title, description, onConfirm, onCancel } = useConfirmDialog();
</script>

<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="onCancel">
          <slot name="cancel">
            Discard
          </slot>
        </AlertDialogCancel>
        <AlertDialogAction @click="onConfirm">
          <slot name="confirm">
            OK
          </slot>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
