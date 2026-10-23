/**
 * API client for Lucentra backend endpoints.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}

export interface Transaction {
  id: string
  transaction_id: string
  transaction_event_code: string
  transaction_initiation_date: string
  transaction_updated_date?: string
  gross_amount: number
  fee_amount: number
  net_amount: number
  currency: string
  transaction_status: string
  payer_email?: string
  payer_name?: string
  custom_field?: string
  invoice_id?: string
  is_demo: boolean
}

export interface Dispute {
  id: string
  dispute_id: string
  create_time: string
  update_time?: string
  disputed_amount: number
  currency: string
  status: string
  dispute_reason: string
  dispute_life_cycle_stage?: string
  dispute_channel?: string
  seller_response_due_date?: string
  buyer_transaction_id?: string
  is_demo: boolean
}

export interface ReconResult {
  id: string
  transaction_id?: string
  order_id?: string
  match_status: string
  match_rule: string
  explanation: string
  discrepancy_amount?: number
  currency: string
  manual_override: boolean
  correction_reason?: string
  created_at: string
}

export const api = {
  // Transactions
  getTransactions: (limit = 100, offset = 0) =>
    request<{ transactions: Transaction[]; total: number }>(`/transactions?limit=${limit}&offset=${offset}`),
  syncTransactions: () =>
    request<{ status: string }>('/transactions/sync', { method: 'POST' }),

  // Disputes
  getDisputes: () =>
    request<{ disputes: Dispute[]; total: number }>('/disputes'),
  getDispute: (id: string) =>
    request<Dispute>(`/disputes/${id}`),

  // Reconciliation
  getReconResults: () =>
    request<{ results: ReconResult[]; summary: Record<string, number> }>('/reconciliation/results'),
  runReconciliation: () =>
    request<{ status: string; processed: number }>('/reconciliation/run', { method: 'POST' }),
  correctReconciliation: (id: string, reason: string, correctedStatus: string) =>
    request<ReconResult>(`/reconciliation/${id}/correct`, {
      method: 'PATCH',
      body: JSON.stringify({ reason, match_status: correctedStatus }),
    }),

  // Audit
  getAuditEvents: (limit = 100) =>
    request<{ events: any[]; total: number }>(`/audit/events?limit=${limit}`),
  verifyAuditChain: () =>
    request<{ valid: boolean; broken_at: string | null; total_checked: number }>('/audit/verify'),

  // AI
  generateEvidenceDraft: (disputeId: string) =>
    request<any>('/ai/dispute-draft', {
      method: 'POST',
      body: JSON.stringify({ dispute_id: disputeId }),
    }),
  askLucentra: (prompt: string) =>
    request<{ answer: string; sql_query?: string; record_refs?: string[] }>('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),
}
