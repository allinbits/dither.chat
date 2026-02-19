export const SOCIAL_LINK_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
} as const;

export const SOCIAL_LINK_ERROR_REASON = {
  PROOF_MISMATCH: 'proof_mismatch',
  VERIFICATION_FAILED: 'verification_failed',
} as const;
