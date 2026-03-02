import type { Component } from 'vue';

import { Github } from 'lucide-vue-next';

import XIcon from '../components/XIcon.vue';

export interface SocialProvider {
  id: string;
  label: string;
  icon: Component;
  extractUsername: (url: string) => string | null;
  profileUrl: (handle: string) => string;
  helpUrl: (verificationCode: string) => string;
  helpLabel: string;
  instructionsHtml: string;
  proofContent: (verificationCode: string) => string;
  proofPlaceholder: string;
}

const xProvider: SocialProvider = {
  id: 'x',
  label: 'X',
  icon: XIcon,
  extractUsername(url: string): string | null {
    const match = url.match(/^https:\/\/(?:www\.)?x\.com\/([^/]+)\/status\/\d+\/?$/i);
    return match ? (match[1] ?? null) : null;
  },
  profileUrl(handle: string): string {
    return `https://x.com/${handle}`;
  },
  helpUrl(verificationCode: string): string {
    const text = `I'm verifying my Dither.chat identity.\n\nVerification code: ${verificationCode}\n\n@_Dither`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  },
  helpLabel: 'Tweet it now',
  instructionsHtml: 'Please tweet the text below exactly as it appears.',
  proofContent(verificationCode: string): string {
    return `I'm verifying my Dither.chat identity.\n\nVerification code: ${verificationCode}\n\n@_Dither`;
  },
  proofPlaceholder: 'https://x.com/yourhandle/status/...',
};

const githubProvider: SocialProvider = {
  id: 'github',
  label: 'GitHub',
  icon: Github,
  extractUsername(url: string): string | null {
    const match = url.match(/^https:\/\/gist\.github\.com\/([^/]+)\/([a-z0-9]+)\/?$/i);
    return match ? (match[1] ?? null) : null;
  },
  profileUrl(handle: string): string {
    return `https://github.com/${handle}`;
  },
  helpUrl(_verificationCode: string): string {
    return 'https://gist.github.com/';
  },
  helpLabel: 'Create a gist',
  instructionsHtml: 'Create a public gist with a file named <strong>dither.md</strong> and paste the content below exactly as it appears.',
  proofContent(verificationCode: string): string {
    return `# Dither.chat Verification\n\nI am verifying my Dither.chat identity.\n\nVerification code: ${verificationCode}`;
  },
  proofPlaceholder: 'https://gist.github.com/yourhandle/yourgistid',
};

export const providers: SocialProvider[] = [xProvider, githubProvider];
