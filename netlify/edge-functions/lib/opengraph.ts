/**
 * Open Graph metadata extracted from HTML.
 */
export interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  error?: string;
}

function resolveUrl(relativeUrl: string, baseUrl: URL): string | undefined {
  try {
    return new URL(relativeUrl, baseUrl.origin).href;
  } catch {
    return undefined;
  }
}

function extractMetaTag(
  html: string,
  property: string,
  attribute: 'property' | 'name' = 'property',
): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+${attribute}=["']${property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]+content=["']([^"']+)["']`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
      'i',
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

function extractOgMeta(html: string, property: string): string | undefined {
  return extractMetaTag(html, `og:${property}`, 'property')
    || extractMetaTag(html, property, 'name');
}

function extractTwitterMeta(html: string, property: string): string | undefined {
  return extractMetaTag(html, `twitter:${property}`, 'name')
    || extractMetaTag(html, `twitter:${property}`, 'property');
}

function extractTitle(html: string): string | undefined {
  return extractOgMeta(html, 'title')
    || extractTwitterMeta(html, 'title')
    || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
}

function extractDescription(html: string): string | undefined {
  return extractOgMeta(html, 'description')
    || extractTwitterMeta(html, 'description')
    || extractMetaTag(html, 'description', 'name');
}

function extractImage(html: string, baseUrl: URL): string | undefined {
  const image = extractOgMeta(html, 'image')
    || extractTwitterMeta(html, 'image');

  if (!image) return undefined;

  if (!image.startsWith('http')) {
    return resolveUrl(image, baseUrl) || image;
  }

  return image;
}

function buildMetadata(
  title: string | undefined,
  description: string | undefined,
  image: string | undefined,
  siteName: string | undefined,
  url: string,
): LinkMetadata {
  const hasMetadata = !!(title || description || image);

  return {
    url,
    ...(title && { title }),
    ...(description && { description }),
    ...(image && { image }),
    ...(siteName && { siteName }),
    ...(!hasMetadata && { error: 'No metadata found on this page' }),
  };
}

/**
 * Extracts Open Graph, Twitter Card, and standard meta tags from HTML.
 *
 * @param html - The HTML content to parse
 * @param baseUrl - Base URL for resolving relative image URLs
 * @returns Extracted metadata with title, description, image, siteName, and url
 */
export function extractMetadata(html: string, baseUrl: URL): LinkMetadata {
  const title = extractTitle(html);
  const description = extractDescription(html);
  const image = extractImage(html, baseUrl);
  const siteName = extractOgMeta(html, 'site_name');

  return buildMetadata(title, description, image, siteName, baseUrl.href);
}
