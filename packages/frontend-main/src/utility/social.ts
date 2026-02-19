export { getSocialProofCode } from '@atomone/dither-api-types';

export function generateTweetText(proofCode: string): string {
  return `I'm verifying my Dither.chat identity.

Verification code: ${proofCode}

@_Dither`;
}

export function getTweetIntentUrl(text: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
