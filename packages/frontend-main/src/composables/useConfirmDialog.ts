import { ref } from 'vue';

const isOpen = ref(false);
const title = ref<string>();
const description = ref<string>();
const onConfirm = ref<() => void>();
const onCancel = ref<() => void>();

interface ConfirmDialogArgs {
    title: string;
    description: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export const useConfirmDialog = () => {
    const showConfirmDialog = (args: ConfirmDialogArgs) => {
        isOpen.value = true;
        title.value = args.title;
        description.value = args.description;
        onConfirm.value = args.onConfirm ?? (() => {});
        onCancel.value = args.onCancel ?? (() => {});
    };

    const hideConfirmDialog = () => {
        isOpen.value = false;
        title.value = undefined;
        description.value = undefined;
        onConfirm.value = undefined;
        onCancel.value = undefined;
    };

    return {
        isOpen,
        title,
        description,
        onConfirm,
        onCancel,
        showConfirmDialog,
        hideConfirmDialog,
    };
};
