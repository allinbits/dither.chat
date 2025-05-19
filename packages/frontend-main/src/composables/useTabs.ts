import { reactive } from 'vue';

type Activetab = 1 | 2;
type TabsState = {
    activeTab: Activetab;
};

const state = reactive<TabsState>({
    activeTab: 1,
});

export function useTabs() {
    const setActiveTab = (activeTab: Activetab) => {
        state.activeTab = activeTab;
    };

    return {
        state,
        setActiveTab,
    };
}
