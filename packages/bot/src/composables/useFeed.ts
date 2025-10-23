import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/vue-query";

const LIMIT = 15;

// API configuration - using same env config as frontend-main
const getApiUrl = () => {
  const envType = import.meta.env.ENVIRONMENT_TYPE || "testnet";

  switch (envType) {
    case "mainnet":
      return (
        import.meta.env.VITE_API_ROOT_MAINNET ||
        "https://api.mainnet.dither.chat/v1"
      );
    case "testnet":
      return (
        import.meta.env.VITE_API_ROOT_TESTNET ||
        "https://api.testnet.dither.chat/v1"
      );
    case "devnet":
      return (
        import.meta.env.VITE_API_ROOT_DEVNET ||
        "https://dither-staging.stuyk.com/v1"
      );
    default:
      return (
        import.meta.env.VITE_API_ROOT_TESTNET ||
        "https://api.testnet.dither.chat/v1"
      );
  }
};

const API_BASE_URL = getApiUrl();

export const feed = () => {
  return infiniteQueryOptions({
    queryKey: ["feed"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        `${API_BASE_URL}/feed?offset=${pageParam}&limit=${LIMIT}`,
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      // Return the posts array directly
      return json.rows ?? [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT) return undefined;
      return allPages.length * LIMIT;
    },
    staleTime: Infinity,
  });
};

export function useFeed() {
  return useInfiniteQuery(feed());
}
