import type { Post } from './shared.ts';

import { formatAuthorAddress, formatDate, truncateText } from './shared.ts';

export const components = {
  /**
   * Creates the avatar component (circle with "D").
   */
  avatar: () => ({
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
  }),
  /**
   * Creates the header section with avatar and author address.
   */
  header: (author: string) => ({
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
        components.avatar(),
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
  content: (post: Post) => ({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        flex: 1,
      },
      children: [
        components.header(post.author),
        components.message(post.message),
        components.footer(post.timestamp),
      ],
    },
  }),
  /**
   * Creates the root container component.
   */
  container: (post: Post) => ({
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
      children: [components.content(post)],
    },
  }),
};
