import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useWalletDialogStore = defineStore('walletDialogStore', () => {
    const isOpen = ref(false);
    const connectedCallback = ref<CallableFunction | null>(null);

    const showDialog = (callback: CallableFunction | null) => {
        isOpen.value = true;
        connectedCallback.value = callback;
    };

    const hideDialog = () => {
        isOpen.value = false;
    };

    return { isOpen, showDialog, hideDialog, connectedCallback };
});
