// Type declarations for Deno/Netlify Edge Functions
// This allows TypeScript to accept URL imports and Deno globals

// Satori types from esm.sh
declare module 'https://esm.sh/satori@0.10.11' {
  import type { SatoriOptions } from 'satori';

  interface JSXElement { type: string; props: Record<string, unknown> }

  const defaultExport: (element: JSXElement, options: SatoriOptions) => Promise<string>;
  export default defaultExport;
}

// Generic URL imports fallback
declare module 'https://*' {
  const content: any;
  export default content;
}

declare module 'https://esm.sh/*' {
  const content: any;
  export default content;
}

// JSX namespace declarations for Preact
declare namespace JSX {
  interface Element {
    type: string;
    props: Record<string, unknown>;
  }

  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }

  interface ElementChildrenAttribute {
    children: unknown;
  }
}

// Deno global types
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

// Cache API for Netlify Edge Functions
// Standard CacheStorage API as per https://docs.netlify.com/build/caching/cache-api/
interface CacheStorage {
  open: (name: string) => Promise<Cache>;
  match: (request: Request | string) => Promise<Response | undefined>;
}

interface Cache {
  match: (request: Request | string) => Promise<Response | undefined>;
  put: (request: Request | string, response: Response) => Promise<void>;
  delete: (request: Request | string) => Promise<boolean>;
  add: (request: Request | string) => Promise<void>;
  addAll: (requests: (Request | string)[]) => Promise<void>;
}

declare const caches: CacheStorage;
