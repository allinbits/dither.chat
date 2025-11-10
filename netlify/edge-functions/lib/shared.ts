interface Post {
  hash: string;
  author: string;
  message: string;
  timestamp: Date;
}

export async function getPost(hash: string): Promise<Post | null> {
  const apiRoot = Deno.env.get('API_ROOT');
  if (!apiRoot) {
    throw new Error('API_ROOT environment variable is not set');
  }

  const response = await fetch(`${apiRoot}/post?hash=${hash}`);
  if (!response.ok) {
    return response.status === 404 ? null : null;
  }

  const result = await response.json();
  if (result.status === 404 || !result.rows?.length) {
    return null;
  }

  return {
    ...result.rows[0],
    timestamp: new Date(result.rows[0].timestamp),
  };
}

export function truncateText(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;
}

export function formatAuthorAddress(address: string): string {
  return address.length <= 20 ? address : `${address.slice(0, 10)}...${address.slice(-8)}`;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
