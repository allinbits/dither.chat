import type { Post } from './shared.ts';

import { formatAuthorAddress, formatDate, truncateText } from './shared.ts';

export const components = {
  /**
   * Creates the identicon avatar component using Dicebear API.
   * Uses pixel-art style with proper URL encoding and API options.
   * Accepts either a URL or a base64 data URI for the image source.
   */
  identicon: (avatarDataUri?: string) => {
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
  header: (author: string, avatarDataUri: string) => ({
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
  }),
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
  content: (post: Post, avatarDataUri: string) => ({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        flex: 1,
      },
      children: [
        components.header(post.author, avatarDataUri),
        components.message(post.message),
        components.footer(post.timestamp),
      ],
    },
  }),
  /**
   * Creates the root container component.
   * Accepts an optional avatar data URI for pre-loaded avatar images.
   */
  container: (post: Post, avatarDataUri: string) => ({
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
      children: [components.content(post, avatarDataUri)],
    },
  }),
};
