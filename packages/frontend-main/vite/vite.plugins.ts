import type { Plugin } from 'vite';

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import merge from 'lodash.merge';

export function cspMetaTagPlugin(): Plugin {
  return {
    name: 'csp-meta-tag',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        const dev = process.env.NODE_ENV === 'development';
        const skip = process.env.VITE_SKIP_CSP === 'true';

        if (skip) return html;

        const baseCSP = JSON.parse(readPublicFile('csp.json'));
        const devCSP = JSON.parse(readPublicFile('csp.dev.json'));
        const finalCSP = dev ? merge(baseCSP, devCSP) : baseCSP;

        const cspString = Object.entries(finalCSP)
          .map(([directive, values]) => `${directive} ${(values as string[]).join(' ')}`)
          .join('; ');

        const escapedContent = escapeHtml(cspString);

        return html.replace(
          /<!-- CSP will be injected here -->/,
          `<meta http-equiv="Content-Security-Policy" content="${escapedContent}">`,
        );
      },
    },
  };
}

function readPublicFile(fileName: string): string {
  const publicDir = path.resolve(process.cwd(), 'public');
  return fs.readFileSync(path.join(publicDir, fileName), 'utf-8');
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
