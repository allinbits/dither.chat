import { Resvg } from 'https://esm.sh/@resvg/resvg-js@2.6.2';
import satori from 'https://esm.sh/satori@0.10.11';

interface Post {
  hash: string;
  author: string;
  message: string;
  timestamp: Date;
}

async function getPost(hash: string): Promise<Post | null> {
  const apiRoot = Deno.env.get('API_ROOT');
  if (!apiRoot) {
    throw new Error('API_ROOT environment variable is not set');
  }

  try {
    const response = await fetch(`${apiRoot}/post?hash=${hash}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 404 || !result.rows?.length) {
      return null;
    }

    const post = result.rows[0];
    return {
      ...post,
      timestamp: new Date(post.timestamp),
    };
  } catch (error) {
    console.error('Error fetching post from API:', error);
    throw error;
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

function formatAuthorAddress(address: string): string {
  if (address.length <= 20) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default async (request: Request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Extract post hash from /og-image/:hash
  if (pathParts[0] !== 'og-image' || pathParts.length < 2) {
    return new Response('Not Found', { status: 404 });
  }

  const postHash = pathParts[1].replace(/\.(png|jpg|jpeg)$/i, '');

  try {
    const post = await getPost(postHash);

    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    // Generate SVG using Satori
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
            fontFamily: 'system-ui, -apple-system, sans-serif',
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
                            style: {
                              color: '#888888',
                            },
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
                        {
                          type: 'div',
                          props: {
                            children: formatDate(post.timestamp),
                          },
                        },
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
                        {
                          type: 'div',
                          props: {
                            children: 'dither.chat',
                          },
                        },
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
            name: 'system-ui',
            data: new Uint8Array(0),
            weight: 400,
            style: 'normal',
          },
        ],
      },
    );

    // Convert SVG to PNG using Resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    });
    const pngData = resvg.render();
    const png = pngData.asPng();

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error in og-image edge function:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
