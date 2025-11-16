/**
 * Fetches Open Graph metadata from external URLs.
 *
 * Intercepts `/link-meta?url={encoded_url}` requests and returns JSON with OG metadata.
 *
 * @param request - The incoming HTTP request
 * @returns JSON response with link metadata
 * @throws {400} Missing or invalid URL parameter
 * @throws {500} Error fetching or parsing URL
 */
export default async (request: Request) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing url parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL protocol' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid URL format' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    // Fetch the URL with timeout (5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://dither.chat)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch URL: ${response.status}` }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const html = await response.text();

    // Extract OG metadata using regex
    const extractMeta = (property: string): string | undefined => {
      // Try og:property first
      const ogPattern = new RegExp(
        `<meta\\s+property=["']og:${property}["']\\s+content=["']([^"']+)["']`,
        'i',
      );
      const ogMatch = html.match(ogPattern);
      if (ogMatch) return ogMatch[1];

      // Fallback to name attribute
      const namePattern = new RegExp(
        `<meta\\s+name=["']${property}["']\\s+content=["']([^"']+)["']`,
        'i',
      );
      const nameMatch = html.match(namePattern);
      if (nameMatch) return nameMatch[1];

      return undefined;
    };

    // Extract title (og:title or <title> tag)
    const title
      = extractMeta('title')
        || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

    // Extract description
    const description = extractMeta('description');

    // Extract image (resolve relative URLs)
    let image = extractMeta('image');
    if (image && !image.startsWith('http')) {
      try {
        image = new URL(image, parsedUrl.origin).href;
      } catch {
        // If URL resolution fails, keep original
      }
    }

    // Extract site name
    const siteName = extractMeta('site_name');

    // Build response
    const metadata: {
      title?: string;
      description?: string;
      image?: string;
      url?: string;
      siteName?: string;
    } = {};

    if (title) metadata.title = title;
    if (description) metadata.description = description;
    if (image) metadata.image = image;
    if (siteName) metadata.siteName = siteName;
    metadata.url = parsedUrl.href;

    return new Response(JSON.stringify(metadata), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Request timeout' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    console.error('Error in link-meta:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch metadata' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
