import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWalletDialogStore = defineStore('walletDialogStore', () => {
  const isOpen = ref(false);
  const onWalletConnected = ref<CallableFunction | null>(null);

  const showDialog = (_: Event | null = null, callback: CallableFunction | null = null) => {
    isOpen.value = true;
    onWalletConnected.value = callback;
  };

  const hideDialog = () => {
    isOpen.value = false;
  };

  return { isOpen, showDialog, hideDialog, onWalletConnected };
});
