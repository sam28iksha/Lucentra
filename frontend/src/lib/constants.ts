export const APP_NAME = 'Lucentra'
export const APP_TAGLINE = 'AI-powered payment dispute & reconciliation'

export const DISPUTE_STATUSES = {
  OPEN: 'Open',
  WAITING_FOR_SELLER_RESPONSE: 'Waiting for Seller',
  WAITING_FOR_BUYER_RESPONSE: 'Waiting for Buyer',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  OTHER: 'Other',
} as const

export const RECON_STATES = {
  MATCHED: 'matched',
  PARTIALLY_MATCHED: 'partially_matched',
  UNMATCHED: 'unmatched',
  AMOUNT_MISMATCH: 'amount_mismatch',
  CURRENCY_MISMATCH: 'currency_mismatch',
  DUPLICATE_CANDIDATE: 'duplicate_candidate',
  MISSING_ORDER: 'missing_order',
  PENDING_EXTERNAL: 'pending_external',
  NEEDS_MANUAL_REVIEW: 'needs_manual_review',
} as const
