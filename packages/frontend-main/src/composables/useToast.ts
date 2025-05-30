import { ref } from 'vue';

const notifTitle = ref('');
const notifDesc = ref('');
const open = ref(false);

export const useToast = () => {
    const showToast = (title: string, desc: string) => {
        notifTitle.value = title;
        notifDesc.value = desc;
        open.value = true;
    };

    const hideToast = () => {
        notifTitle.value = '';
        notifDesc.value = '';
        open.value = false;
    };

    return {
        title: notifTitle,
        desc: notifDesc,
        open,
        showToast,
        hideToast,
    };
};
