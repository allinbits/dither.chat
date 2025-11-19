export const TRUSTED_IMAGE_SOURCES = ['i.imgur.com', 'imgur.com'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif'];
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

export function isFromTrustedDomain(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return TRUSTED_IMAGE_SOURCES.includes(parsedUrl.host.toLowerCase());
  } catch {
    return false;
  }
}

export function hasValidImageExtension(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_IMAGE_EXTENSIONS.some(ext =>
      parsedUrl.pathname.toLowerCase().endsWith(ext),
    );
  } catch {
    return false;
  }
}

export function isValidImageURL(url: string): boolean {
  return isFromTrustedDomain(url) && hasValidImageExtension(url);
}

export function isValidVideoURL(url: string): boolean {
  return YOUTUBE_REGEX.test(url);
}

// Extract all image URLs from text, categorizing them into valid and invalid
export function extractAllImageURLs(text: string) {
  const urlRegex = /(https?:\/\/\S+)/g;
  const urls = text.match(urlRegex);

  if (!urls) return { valids: [], invalids: [] };

  const valids = [];
  const invalids: { url: string; reason: string }[] = [];

  for (const url of urls) {
    const trusted = isFromTrustedDomain(url);
    const hasExtension = hasValidImageExtension(url);
    if (trusted && hasExtension) {
      valids.push(url);
    } else if (trusted || hasExtension) {
      invalids.push({
        url,
        reason: trusted
          ? 'INVALID_EXTENSION' as const
          : 'UNTRUSTED_DOMAIN' as const,
      });
    }
  }

  return { valids, invalids };
}

export function extractImageUrl(text: string): string | null {
  const { valids } = extractAllImageURLs(text);
  return valids.length > 0 ? valids[0] : null;
}

export function extractVideoURL(text: string): string | null {
  const match = YOUTUBE_REGEX.exec(text);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}
