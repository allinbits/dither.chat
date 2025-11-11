import satori from 'https://esm.sh/satori@0.10.11';

import { components } from './lib/components.tsx';
import { FONT_URL, TWEMOJI_BASE_URL } from './lib/config.ts';
import { getPost, utf8ToBase64 } from './lib/shared.ts';

/**
 * Converts an emoji string to its code point representation.
 * Handles multi-code-point emojis (e.g., flags, skin tones, ZWJ sequences).
 * Code points are zero-padded to 4 characters as required by twemoji.
 * @param emoji - The emoji string
 * @returns The code point string (e.g., "1f600" for 😀, "1f1fa-1f1f8" for 🇺🇸)
 */
function getIconCode(emoji: string): string {
  const codePoints: string[] = [];
  let i = 0;

  while (i < emoji.length) {
    const codePoint = emoji.codePointAt(i);
    if (codePoint) {
      codePoints.push(codePoint.toString(16).padStart(4, '0'));
      // Skip surrogate pairs (they take 2 UTF-16 units)
      i += codePoint > 0xFFFF ? 2 : 1;
    } else {
      i++;
    }
  }

  return codePoints.join('-');
}

/**
 * Loads an emoji SVG from the twemoji CDN.
 * Uses the GitHub CDN which is the official source for twemoji assets.
 * @param code - The emoji code point string
 * @returns The SVG content as a string
 * @throws {Error} If the emoji cannot be loaded
 */
async function loadEmoji(code: string): Promise<string> {
  // Use GitHub CDN for twemoji assets (official source)
  const url = `${TWEMOJI_BASE_URL}/${code}.svg`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load emoji ${code}: ${response.status}`);
  }
  return await response.text();
}

async function loadAdditionalAsset(code: string, segment: string): Promise<string> {
  // Handle emoji loading
  if (code === 'emoji') {
    try {
      // Convert emoji segment to code point and load SVG from twemoji CDN
      const emojiCode = getIconCode(segment);
      const emojiSvg = await loadEmoji(emojiCode);
      // Return as base64-encoded data URI (using UTF-8 safe encoding)
      return `data:image/svg+xml;base64,${utf8ToBase64(emojiSvg)}`;
    } catch (error) {
      // If emoji fails to load, log details and return the original segment
      // This prevents the entire image generation from failing
      const emojiCode = getIconCode(segment);
      console.warn(`Failed to load emoji "${segment}" (code: ${emojiCode}):`, error);
      return code;
    }
  }

  // If segment is normal text, return as-is
  return code;
}

async function loadFont() {
  const response = await fetch(FONT_URL);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${response.status}`);
  }
  return response;
}

/**
 * Generates Open Graph images for post pages.
 *
 * Intercepts `/og-image/{hash}` requests and generates a 1200x630 SVG image using Satori.
 *
 * @param request - The incoming HTTP request
 * @returns SVG image response (1200x630)
 * @throws {404} Invalid path or post not found
 * @throws {500} Error fetching post, loading fonts, or generating image
 */
export default async (request: Request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  if (pathParts[0] !== 'og-image' || pathParts.length < 2) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const post = await getPost(pathParts[1].replace(/\.(png|jpg|jpeg)$/i, ''));
    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    const fontResponse = await loadFont();

    // Create container with optional pre-loaded avatar data URI
    const container = await components.container(post);

    const svg = await satori(container, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Roboto',
          data: new Uint8Array(await fontResponse.arrayBuffer()),
          weight: 400,
          style: 'normal',
        },
      ],
      loadAdditionalAsset,
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error in og-image:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
