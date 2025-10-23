import { ref, computed } from "vue";

// Types for Dither API responses - matching database schema
export interface Post {
  hash: string;
  post_hash?: string | null;
  author: string;
  timestamp: string;
  message: string;
  quantity: string;
  replies: number;
  likes: number;
  dislikes: number;
  flags: number;
  likes_burnt: string;
  dislikes_burnt: string;
  flags_burnt: string;
  removed_hash?: string | null;
  removed_at?: string | null;
  removed_by?: string | null;
}

export interface User {
  address: string;
  username?: string;
  posts: number;
  followers: number;
  following: number;
  joinedAt: string;
}

export interface SearchResult {
  posts: Post[];
  total: number;
  query: string;
}

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

class DitherAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "DitherAPIError";
  }
}

// API client
class DitherAPIClient {
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    } as Record<string, string> & HeadersInit;

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new DitherAPIError(
          `API request failed: ${response.statusText}`,
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof DitherAPIError) {
        throw error;
      }
      throw new DitherAPIError(`Network error: ${error}`);
    }
  }

  // Public endpoints (no auth required)
  async getFeed(limit = 10, offset = 0): Promise<Post[]> {
    return this.request<Post[]>(`/feed?limit=${limit}&offset=${offset}`);
  }

  async getPost(hash: string): Promise<Post> {
    return this.request<Post>(`/post?hash=${hash}`);
  }

  async searchPosts(query: string, limit = 10): Promise<SearchResult> {
    return this.request<SearchResult>(
      `/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    );
  }

  async getUser(address: string): Promise<User> {
    return this.request<User>(`/user?address=${address}`);
  }

  async getUserPosts(address: string, limit = 10): Promise<Post[]> {
    return this.request<Post[]>(`/posts?address=${address}&limit=${limit}`);
  }

  // Authenticated endpoints
  async likePost(hash: string): Promise<void> {
    return this.request<void>(`/like`, {
      method: "POST",
      body: JSON.stringify({ hash }),
    });
  }

  async dislikePost(hash: string): Promise<void> {
    return this.request<void>(`/dislike`, {
      method: "POST",
      body: JSON.stringify({ hash }),
    });
  }

  async followUser(address: string): Promise<void> {
    return this.request<void>(`/follow`, {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  }

  async unfollowUser(address: string): Promise<void> {
    return this.request<void>(`/unfollow`, {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  }

  async createPost(content: string): Promise<Post> {
    return this.request<Post>(`/post`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async replyToPost(hash: string, content: string): Promise<Post> {
    return this.request<Post>(`/reply`, {
      method: "POST",
      body: JSON.stringify({ hash, content }),
    });
  }
}

// Global API client instance
const apiClient = new DitherAPIClient(API_BASE_URL);

// Composable for feed management
export function useFeed() {
  const posts = ref<Post[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);

  const loadFeed = async (limit = 10, reset = false) => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      const offset = reset ? 0 : posts.value.length;
      const newPosts = await apiClient.getFeed(limit, offset);

      if (reset) {
        posts.value = newPosts;
      } else {
        posts.value.push(...newPosts);
      }

      hasMore.value = newPosts.length === limit;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load feed";
    } finally {
      loading.value = false;
    }
  };

  const refreshFeed = () => loadFeed(10, true);

  return {
    posts: computed(() => posts.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    hasMore: computed(() => hasMore.value),
    loadFeed,
    refreshFeed,
  };
}

// Composable for post interactions
export function usePostInteractions() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const likePost = async (hash: string) => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      await apiClient.likePost(hash);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to like post";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const dislikePost = async (hash: string) => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      await apiClient.dislikePost(hash);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to dislike post";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    likePost,
    dislikePost,
  };
}

// Composable for search
export function useSearch() {
  const results = ref<SearchResult | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const search = async (query: string, limit = 10) => {
    if (!query.trim() || loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      results.value = await apiClient.searchPosts(query, limit);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Search failed";
    } finally {
      loading.value = false;
    }
  };

  const clearResults = () => {
    results.value = null;
    error.value = null;
  };

  return {
    results: computed(() => results.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    search,
    clearResults,
  };
}

// Composable for user management
export function useUser() {
  const user = ref<User | null>(null);
  const userPosts = ref<Post[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadUser = async (address: string) => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      user.value = await apiClient.getUser(address);
      userPosts.value = await apiClient.getUserPosts(address);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load user";
    } finally {
      loading.value = false;
    }
  };

  return {
    user: computed(() => user.value),
    userPosts: computed(() => userPosts.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadUser,
  };
}

// Authentication composable
export function useAuth() {
  const isAuthenticated = ref(false);
  const authToken = ref<string | null>(null);

  const setAuthToken = (token: string) => {
    authToken.value = token;
    isAuthenticated.value = true;
    apiClient.setAuthToken(token);
  };

  const clearAuth = () => {
    authToken.value = null;
    isAuthenticated.value = false;
    apiClient.setAuthToken("");
  };

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    authToken: computed(() => authToken.value),
    setAuthToken,
    clearAuth,
  };
}

// Export the API client for direct use if needed
export { apiClient };
