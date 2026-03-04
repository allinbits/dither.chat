// TODO: Consider migrating to @unhead/vue for reactivity-first SEO management
// See: https://unhead.unjs.io/
// This would provide better SSR support and reactive composables that could be extended to other pages.

interface SeoOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
}

function upsertMeta(
  attributes: Record<string, string>,
) {
  if (typeof document === 'undefined') return;

  const selectorParts = Object.entries(attributes)
    .filter(([key]) => key === 'name' || key === 'property')
    .map(([key, value]) => `[${key}="${value}"]`);

  const selector = selectorParts.join('');
  let element = selector ? document.head.querySelector<HTMLMetaElement>(`meta${selector}`) : null;

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

export function useSEO(options: SeoOptions) {
  if (typeof document === 'undefined') return;

  if (options.title) {
    document.title = options.title;
    upsertMeta({ property: 'og:title', content: options.ogTitle ?? options.title });
  }

  if (options.description) {
    upsertMeta({ name: 'description', content: options.description });
  }

  if (options.ogDescription || options.description) {
    upsertMeta({
      property: 'og:description',
      content: options.ogDescription ?? options.description ?? '',
    });
  }

  if (options.ogUrl) {
    upsertMeta({ property: 'og:url', content: options.ogUrl });
  }
}
