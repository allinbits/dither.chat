import { nextTick, reactive } from 'vue';

type ToastType = 'info' | 'success' | 'error';

type ToastState = {
    title: string;
    desc: string;
    duration: number;
    type: ToastType;
    open: boolean;
    action?: ToastAction;
};

type ToastAction = {
    label: string;
    onClick: () => void;
};

const toastState = reactive<ToastState>({
    title: '',
    desc: '',
    duration: 0,
    type: 'info',
    open: false,
});

export const useToast = () => {
    // If duration is 0, the toast will stay open until hideToast is called
    const showToast = (type: ToastType, title: string, desc: string, duration: number = 0, action?: ToastAction) => {
        // Hide all other toasts
        hideToast();

        nextTick(() => {
            toastState.title = title;
            toastState.desc = desc;
            toastState.duration = duration;
            toastState.type = type;
            toastState.open = true;
            toastState.action = action;
        });
    };

    const hideToast = () => {
        toastState.title = '';
        toastState.desc = '';
        toastState.duration = 0;
        toastState.type = 'info';
        toastState.open = false;
        toastState.action = undefined;
    };

    return {
        toastState,
        showToast,
        hideToast,
    };
};
