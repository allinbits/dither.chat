import satori from 'https://esm.sh/satori@0.10.11';

import { components } from './lib/components.ts';
import { getPost } from './lib/shared.ts';

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

    const svg = await satori(components.container(post), {
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
