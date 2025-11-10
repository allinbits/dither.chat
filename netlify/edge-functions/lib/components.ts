import type { Post } from './shared.ts';

import { AVATAR_BASE_URL } from './config.ts';
import { formatAuthorAddress, formatDate, truncateText, utf8ToBase64 } from './shared.ts';

/**
 * Loads a Dicebear avatar SVG from the Dicebear API.
 * @param author - The author address
 * @returns The SVG content as a string
 * @throws {Error} If the avatar cannot be loaded
 */
async function loadAvatarDataUri(author: string): Promise<string> {
  const encodedSeed = encodeURIComponent(author);
  const dicebearUrl = `${AVATAR_BASE_URL}?seed=${encodedSeed}&size=48&backgroundColor=EFEFEF&radius=50`;
  const avatarResponse = await fetch(dicebearUrl);
  if (!avatarResponse.ok) {
    throw new Error(`Failed to load Dicebear avatar: ${avatarResponse.status}`);
  }
  const avatarSvg = await avatarResponse.text();
  return `data:image/svg+xml;base64,${utf8ToBase64(avatarSvg)}`;
}

export const components = {
  /**
   * Creates the identicon avatar component using Dicebear API.
   * Uses pixel-art style with proper URL encoding and API options.
   * Accepts either a URL or a base64 data URI for the image source.
   */
  identicon: (avatarDataUri: string) => {
    // If base64 data URI is provided, use it directly (better performance per Satori docs)
    // Otherwise, construct the URL
    const src = avatarDataUri;

    return {
      type: 'img',
      props: {
        src,
        width: 48,
        height: 48,
        alt: 'Avatar',
        style: {
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          backgroundColor: '#FFFFFF',
          filter: 'invert(0.96)',
        },
      },
    };
  },
  /**
   * Creates the avatar component wrapper.
   */
  avatar: (avatarDataUri: string) => {
    const identicon = components.identicon(avatarDataUri);
    return {
      type: 'div',
      props: {
        style: {
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        },
        children: identicon,
      },
    };
  },
  /**
   * Creates the header section with avatar and author address.
   */
  header: async (author: string) => {
    const avatarDataUri = await loadAvatarDataUri(author);
    return {
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
          components.avatar(avatarDataUri),
          {
            type: 'div',
            props: {
              style: { color: '#888888' },
              children: formatAuthorAddress(author),
            },
          },
        ],
      },
    };
  },
  /**
   * Creates the message content section.
   */
  message: (message: string) => ({
    type: 'div',
    props: {
      style: {
        fontSize: '36px',
        lineHeight: '1.4',
        fontWeight: 500,
        color: '#ffffff',
        flex: 1,
      },
      children: truncateText(message, 200),
    },
  }),

  /**
   * Creates the footer section with date, separator dot, and site name.
   */
  footer: (timestamp: Date) => ({
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
        { type: 'div', props: { children: formatDate(timestamp) } },
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
  }),
  /**
   * Creates the main content container with all post sections.
   */
  content: async (post: Post) => {
    const header = await components.header(post.author);
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          flex: 1,
        },
        children: [
          header,
          components.message(post.message),
          components.footer(post.timestamp),
        ],
      },
    };
  },
  /**
   * Creates the root container component.
   */
  container: async (post: Post) => {
    const content = await components.content(post);
    return ({
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
        children: [content],
      },
    });
  },
};
