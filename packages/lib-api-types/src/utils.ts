/**
 * Generates a deterministic verification code from a wallet address.
 * Strips the prefix, then takesthe first 4 and last 4 characters of the remaining data part.
 *
 * Output format: "XXXX-YYYY"
 *
 * Used by both frontend and backend to ensure the code shown to the user
 * matches the code verified against the proof tweet.
 */
export function getSocialProofCode(address: string): string {
  const withoutPrefix = address.replace(/^[a-z]+1/, '');
  const first4 = withoutPrefix.slice(0, 4);
  const last4 = withoutPrefix.slice(-4);
  return `${first4}-${last4}`.toUpperCase();
}
