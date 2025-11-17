import type { ComputedRef, Ref } from 'vue';

import { queryOptions, useQuery } from '@tanstack/vue-query';

export interface LinkPreview {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  error?: string;
}

interface Params {
  url: Ref<string> | ComputedRef<string>;
}

export function linkPreview(params: Params) {
  return queryOptions({
    queryKey: ['linkPreview', params.url],
    queryFn: async (): Promise<LinkPreview> => {
      const urlValue = params.url.value;

      if (!urlValue) {
        throw new Error('URL is required');
      }

      const encodedUrl = encodeURIComponent(urlValue);
      const response = await fetch(`/link-meta?url=${encodedUrl}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch metadata' }));
        throw new Error(errorData.error || 'Failed to fetch metadata');
      }

      const data: LinkPreview = await response.json();

      // If there's an error in the response, throw it
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    enabled: () => {
      const urlValue = params.url.value;
      return !!urlValue && urlValue.startsWith('http');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLinkPreview(params: Params) {
  return useQuery(linkPreview(params));
}
