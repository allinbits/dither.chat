import { useConfigStore } from '@/stores/useConfigStore';

export function useAvailableHandleChecker() {
  const configStore = useConfigStore();
  const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000/v1';

  return async (handle: string): Promise<boolean> => {
    if (!handle?.trim()) {
      return false;
    }

    const response = await fetch(`${apiRoot}/account?handle=${handle}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => undefined);
      throw new Error(errorData?.error || 'Failed to fetch account');
    }

    const result = await response.json();
    return (result.status === 404 || !result.rows?.length);
  };
}
