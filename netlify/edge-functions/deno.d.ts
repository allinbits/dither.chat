// Type declarations for Deno/Netlify Edge Functions
// This allows TypeScript to accept URL imports and Deno globals

// Satori types from esm.sh
declare module 'https://esm.sh/satori@0.10.11' {
  export { default } from 'satori';
  export * from 'satori';
}

// Generic URL imports fallback
declare module 'https://*' {
  const content: any;
  export default content;
  export * from content;
}

declare module 'https://esm.sh/*' {
  const content: any;
  export default content;
  export * from content;
}

// Deno global types
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

