import { externalLinks } from '@/config/externalLinks';

type ExternalLinkKey = keyof typeof externalLinks;

export function useExternalLink() {
  function openExternalLink(key: ExternalLinkKey) {
    const url = externalLinks[key];
    if (!url) {
      console.warn(`External link key "${key}" not found`);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return {
    openExternalLink,
  };
}
