import satori from 'https://esm.sh/satori@0.10.11';

import { formatAuthorAddress, formatDate, getPost, truncateText } from './lib/shared.ts';

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

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#0a0a0a',
            color: '#ffffff',
            fontFamily: 'Roboto, sans-serif',
            padding: '60px',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  flex: 1,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '24px',
                        fontWeight: 600,
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: '#1a1a1a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              fontWeight: 700,
                            },
                            children: 'D',
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: { color: '#888888' },
                            children: formatAuthorAddress(post.author),
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '36px',
                        lineHeight: '1.4',
                        fontWeight: 500,
                        color: '#ffffff',
                        flex: 1,
                      },
                      children: truncateText(post.message, 200),
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '20px',
                        color: '#666666',
                      },
                      children: [
                        { type: 'div', props: { children: formatDate(post.timestamp) } },
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: '#666666',
                            },
                          },
                        },
                        { type: 'div', props: { children: 'dither.chat' } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
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
      },
    );

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
