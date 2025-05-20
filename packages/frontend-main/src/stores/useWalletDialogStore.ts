import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useWalletDialogStore = defineStore('walletDialogStore', () => {
    const isOpen = ref(false);

    const showDialog = () => {
        isOpen.value = true;
    };

    const hideDialog = () => {
        isOpen.value = false;
    };

    return { isOpen, showDialog, hideDialog };
});
