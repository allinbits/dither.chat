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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatAuthorAddress(address: string): string {
  if (address.length <= 20) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

export default async (request: Request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Extract post hash from /post/:hash
  if (pathParts[0] !== 'post' || pathParts.length < 2) {
    return new Response('Not Found', { status: 404 });
  }

  const postHash = pathParts[1];

  try {
    const post = await getPost(postHash);

    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    // Fetch the base HTML template from the origin
    const origin = url.origin;
    const htmlResponse = await fetch(`${origin}/index.html`);

    if (!htmlResponse.ok) {
      console.error(`Failed to fetch HTML template: ${htmlResponse.status}`);
      return new Response('Failed to load template', { status: 500 });
    }

    let html = await htmlResponse.text();

    // Prepare dynamic values
    const siteUrl = url.origin;
    const postUrl = `${siteUrl}/post/${post.hash}`;
    const ogImageUrl = `${siteUrl}/og-image/${post.hash}`;
    const title = `Post by ${formatAuthorAddress(post.author)} | dither.chat`;
    const description = truncateText(post.message, 200);
    const escapedDescription = escapeHtml(description);

    // Replace meta tags
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${escapeHtml(title)}</title>`,
    );

    html = html.replace(
      /<meta\s+name="title"\s+content=".*?"\s*\/?>/,
      `<meta name="title" content="${escapeHtml(title)}" />`,
    );

    html = html.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
      `<meta name="description" content="${escapedDescription}" />`,
    );

    html = html.replace(
      /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/,
      '<meta property="og:type" content="article" />',
    );

    html = html.replace(
      /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/,
      `<meta property="og:url" content="${postUrl}" />`,
    );

    html = html.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
    );

    html = html.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/,
      `<meta property="og:description" content="${escapedDescription}" />`,
    );

    html = html.replace(
      /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/,
      `<meta property="og:image" content="${ogImageUrl}" />`,
    );

    html = html.replace(
      /<meta\s+property="twitter:card"\s+content=".*?"\s*\/?>/,
      '<meta property="twitter:card" content="summary_large_image" />',
    );

    html = html.replace(
      /<meta\s+property="twitter:url"\s+content=".*?"\s*\/?>/,
      `<meta property="twitter:url" content="${postUrl}" />`,
    );

    html = html.replace(
      /<meta\s+property="twitter:title"\s+content=".*?"\s*\/?>/,
      `<meta property="twitter:title" content="${escapeHtml(title)}" />`,
    );

    html = html.replace(
      /<meta\s+property="twitter:description"\s+content=".*?"\s*\/?>/,
      `<meta property="twitter:description" content="${escapedDescription}" />`,
    );

    html = html.replace(
      /<meta\s+property="twitter:image"\s+content=".*?"\s*\/?>/,
      `<meta property="twitter:image" content="${ogImageUrl}" />`,
    );

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in post-meta edge function:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
