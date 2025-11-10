import satori from 'https://esm.sh/satori@0.10.11';

import { components } from './lib/components.ts';
import { getPost } from './lib/shared.ts';

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
 * Converts a UTF-8 string to base64.
 * Handles Unicode characters properly unlike btoa which only works with Latin1.
 * @param str - The string to encode
 * @returns Base64-encoded string
 */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${code}.svg`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load emoji ${code}: ${response.status}`);
  }
  return await response.text();
}

/**
 * Loads a Dicebear avatar SVG from the Dicebear API.
 * @param url - The Dicebear API URL
 * @returns The SVG content as a string
 * @throws {Error} If the avatar cannot be loaded
 */
async function loadDicebearAvatar(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load Dicebear avatar: ${response.status}`);
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

    const fontResponse = await fetch(
      'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf',
    );
    if (!fontResponse.ok) {
      throw new Error(`Failed to load font: ${fontResponse.status}`);
    }

    // Pre-fetch the avatar image and convert to base64 for better performance
    // According to Satori docs: "it would be better to use base64 encoded image data
    // directly as props.src so no extra I/O is needed in Satori"
    // The avatar data URI is derived within the container rendering
    const encodedSeed = encodeURIComponent(post.author);
    const dicebearUrl = `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodedSeed}&size=48&backgroundColor=1a1a1a&radius=50`;
    let avatarDataUri: string | undefined;

    try {
      const avatarSvg = await loadDicebearAvatar(dicebearUrl);
      avatarDataUri = `data:image/svg+xml;base64,${utf8ToBase64(avatarSvg)}`;
    } catch (error) {
      console.warn(`Failed to pre-load Dicebear avatar:`, error);
      // Continue without avatar - will fall back to URL
    }

    // Create container with optional pre-loaded avatar data URI
    const container = components.container(post, avatarDataUri || '');

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
