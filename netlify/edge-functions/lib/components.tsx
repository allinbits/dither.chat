/** @jsxImportSource https://esm.sh/preact */
import type { Post } from './shared.ts';

import { formatAuthorAddress, formatDate, loadAvatarDataUri } from './shared.ts';

const styles = {
  identicon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
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

function Identicon(props: { avatarDataUri: string }) {
  return <img src={props.avatarDataUri} width={48} height={48} alt="Avatar" style={styles.identicon} />;
}

function Avatar(props: { avatarDataUri: string }) {
  return (
    <div style={styles.avatar}>
      <Identicon avatarDataUri={props.avatarDataUri} />
    </div>
  );
}

function Header(props: { avatarDataUri: string; author: string }) {
  return (
    <div style={styles.header}>
      <Avatar avatarDataUri={props.avatarDataUri} />
      <div style={styles.headerAuthor}>{formatAuthorAddress(props.author)}</div>
    </div>
  );
}

function Message(props: { message: string }) {
  return <div style={styles.message}>{props.message}</div>;
}

function Footer(props: { timestamp: Date }) {
  return (
    <div style={styles.footer}>
      <div>{formatDate(props.timestamp)}</div>
      <div style={styles.footerDot}></div>
      <div>dither.chat</div>
    </div>
  );
}

function Content(props: { header: JSX.Element; message: string; timestamp: Date }) {
  return (
    <div style={styles.content}>
      {props.header}
      <Message message={props.message} />
      <Footer timestamp={props.timestamp} />
    </div>
  );
}

function Container(props: { children: JSX.Element }) {
  return <div style={styles.container}>{props.children}</div>;
}

export const components = {
  async header(author: string) {
    const avatarDataUri = await loadAvatarDataUri(author);
    return <Header avatarDataUri={avatarDataUri} author={author} />;
  },
  async content(post: Post) {
    const header = await components.header(post.author);
    return <Content header={header} message={post.message} timestamp={post.timestamp} />;
  },
  async container(post: Post) {
    const content = await components.content(post);
    return <Container>{content}</Container>;
  },
};
