import { reactive } from 'vue';

type TabsState = {
    activeTab: string;
};

const state = reactive<TabsState>({
    activeTab: '',
});

interface Params {
    defaultActiveTab: string;
}

export function useTabs(params: Params) {
    state.activeTab = params.defaultActiveTab;
    const setActiveTab = (activeTab: string) => {
        state.activeTab = activeTab;
    };

    return {
        state,
        setActiveTab,
    };
}
