import { escapeHtml, formatAuthorAddress, getPost, truncateText } from './lib/shared.ts';

export default async (request: Request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  if (pathParts[0] !== 'post' || pathParts.length < 2) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const post = await getPost(pathParts[1]);
    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    const htmlResponse = await fetch(`${url.origin}/index.html`);
    if (!htmlResponse.ok) {
      return new Response('Failed to load template', { status: 500 });
    }

    const siteUrl = url.origin;
    const postUrl = `${siteUrl}/post/${post.hash}`;
    const ogImageUrl = `${siteUrl}/og-image/${post.hash}`;
    const title = `Post by ${formatAuthorAddress(post.author)} | dither.chat`;
    const description = truncateText(post.message, 200);
    const escapedDescription = escapeHtml(description);
    const escapedTitle = escapeHtml(title);

    const replacements: [RegExp, string][] = [
      [/<title>.*?<\/title>/, `<title>${escapedTitle}</title>`],
      [/<meta\s+name="title"\s+content=".*?"\s*\/?>/, `<meta name="title" content="${escapedTitle}" />`],
      [/<meta\s+name="description"\s+content=".*?"\s*\/?>/, `<meta name="description" content="${escapedDescription}" />`],
      [/<meta\s+property="og:type"\s+content=".*?"\s*\/?>/, '<meta property="og:type" content="article" />'],
      [/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/, `<meta property="og:url" content="${postUrl}" />`],
      [/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/, `<meta property="og:title" content="${escapedTitle}" />`],
      [/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/, `<meta property="og:description" content="${escapedDescription}" />`],
      [/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/, `<meta property="og:image" content="${ogImageUrl}" />`],
      [/<meta\s+property="twitter:card"\s+content=".*?"\s*\/?>/, '<meta property="twitter:card" content="summary_large_image" />'],
      [/<meta\s+property="twitter:url"\s+content=".*?"\s*\/?>/, `<meta property="twitter:url" content="${postUrl}" />`],
      [/<meta\s+property="twitter:title"\s+content=".*?"\s*\/?>/, `<meta property="twitter:title" content="${escapedTitle}" />`],
      [/<meta\s+property="twitter:description"\s+content=".*?"\s*\/?>/, `<meta property="twitter:description" content="${escapedDescription}" />`],
      [/<meta\s+property="twitter:image"\s+content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${ogImageUrl}" />`],
    ];

    const html = await htmlResponse.text().then(html =>
      replacements.reduce((html, [pattern, replacement]) => html.replace(pattern, replacement), html),
    );

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error in post-meta:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
