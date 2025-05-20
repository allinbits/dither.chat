import { reactive } from 'vue';

type TabsState = {
    activeTab: string;
};

const state = reactive<TabsState>({
    activeTab: '',
});

export function useTabs({ defaultActiveTab }: { defaultActiveTab: string }) {
    state.activeTab = defaultActiveTab;
    const setActiveTab = (activeTab: string) => {
        state.activeTab = activeTab;
    };

    return {
        state,
        setActiveTab,
    };
}
