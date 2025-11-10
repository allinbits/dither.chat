import type { Post } from './shared.ts';

import { formatAuthorAddress, formatDate, loadAvatarDataUri, truncateText } from './shared.ts';

const styles = {
  identicon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
    backgroundColor: '#FFFFFF',
    filter: 'invert(0.96)',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '24px',
    fontWeight: 600,
  },
  headerAuthor: {
    color: '#888888',
  },
  message: {
    fontSize: '36px',
    lineHeight: '1.4',
    fontWeight: 500,
    color: '#ffffff',
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    color: '#666666',
  },
  footerDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#666666',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    flex: 1,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: 'Roboto, sans-serif',
    padding: '60px',
  },
};

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
        style: styles.identicon,
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
        style: styles.avatar,
        children: identicon,
      },
    };
  },
  /**
   * Creates the header section with avatar and author address.
   */
  async header(author: string) {
    const avatarDataUri = await loadAvatarDataUri(author);
    return {
      type: 'div',
      props: {
        style: styles.header,
        children: [
          components.avatar(avatarDataUri),
          {
            type: 'div',
            props: {
              style: styles.headerAuthor,
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
      style: styles.message,
      children: truncateText(message, 200),
    },
  }),

  /**
   * Creates the footer section with date, separator dot, and site name.
   */
  footer: (timestamp: Date) => ({
    type: 'div',
    props: {
      style: styles.footer,
      children: [
        { type: 'div', props: { children: formatDate(timestamp) } },
        {
          type: 'div',
          props: {
            style: styles.footerDot,
          },
        },
        { type: 'div', props: { children: 'dither.chat' } },
      ],
    },
  }),
  /**
   * Creates the main content container with all post sections.
   */
  async content(post: Post) {
    const header = await components.header(post.author);
    return {
      type: 'div',
      props: {
        style: styles.content,
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
  async container(post: Post) {
    const content = await components.content(post);
    return ({
      type: 'div',
      props: {
        style: styles.container,
        children: [content],
      },
    });
  },
};
