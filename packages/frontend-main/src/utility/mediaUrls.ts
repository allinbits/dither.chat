const TRUSTED_IMAGE_SOURCES = ['i.imgur.com'];
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif'];
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/g;

function isHostTrusted(url: URL): boolean {
  return TRUSTED_IMAGE_SOURCES.includes(url.host.toLowerCase());
}

function isValidImageURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    if (!isHostTrusted(parsedUrl)) return false;
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext =>
      parsedUrl.pathname.toLowerCase().endsWith(ext),
    );
    return hasValidExtension;
  } catch {
    return false;
  }
}

function isValidVideoURL(url: string): boolean {
  return YOUTUBE_REGEX.test(url);
}

function extractImageURL(text: string): string | null {
  const urlRegex = /(https?:\/\/\S+)/g;
  const urls = text.match(urlRegex);
  if (urls) {
    for (const url of urls) {
      if (isValidImageURL(url)) {
        return url;
      }
    }
  }
  return null;
}

function extractVideoURL(text: string): string | null {
  const match = YOUTUBE_REGEX.exec(text);
  if (match && match[1]) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return null;
}

export {
  extractImageURL,
  extractVideoURL,
  isValidImageURL,
  isValidVideoURL,
};
