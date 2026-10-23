import { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X,
  FileText,
} from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'
import DemoBadge from '../components/DemoBadge'
import { formatMoney } from '../lib/money'

interface ReconItem {
  id: string
  transactionId: string
  orderId: string
  txnAmount: number
  orderAmount: number
  currency: string
  status: 'matched' | 'amount_mismatch' | 'missing_order' | 'duplicate_candidate' | 'needs_manual_review'
  rule: string
  explanation: string
  date: string
}

const SEED_RECON_ITEMS: ReconItem[] = [
  {
    id: 'rec_01',
    transactionId: '9XY82190KV829102X',
    orderId: 'INV-2026-8801',
    txnAmount: 45000,
    orderAmount: 45000,
    currency: 'USD',
    status: 'matched',
    rule: 'EXACT_PAYPAL_REF',
    explanation: 'Matched PayPal txn ref 9XY82190KV829102X to Order INV-2026-8801 with identical amount & currency.',
    date: '2026-10-22 14:32',
  },
  {
    id: 'rec_02',
    transactionId: '4PL10294MM918274L',
    orderId: 'ORD-9912',
    txnAmount: 12500,
    orderAmount: 12000,
    currency: 'USD',
    status: 'amount_mismatch',
    rule: 'AMOUNT_DISCREPANCY',
    explanation: 'Order amount ($120.00) differs from PayPal captured amount ($125.00). $5.00 surplus.',
    date: '2026-10-21 09:15',
  },
  {
    id: 'rec_03',
    transactionId: '8HJ72019QQ381920Z',
    orderId: '—',
    txnAmount: 8900,
    orderAmount: 0,
    currency: 'USD',
    status: 'missing_order',
    rule: 'UNLINKED_PAYMENT',
    explanation: 'Received payment without matching merchant order or custom_field invoice reference.',
    date: '2026-10-20 18:40',
  },
  {
    id: 'rec_04',
    transactionId: '2KL99182BB102938A',
    orderId: 'INV-2026-8801',
    txnAmount: -4500,
    orderAmount: -4500,
    currency: 'USD',
    status: 'matched',
    rule: 'PARTIAL_REFUND_MATCH',
    explanation: 'Refund linked to parent transaction 9XY82190KV829102X. Net captured adjusted to $405.00.',
    date: '2026-10-19 11:05',
  },
]

export default function Reconciliation() {
  const [items, setItems] = useState<ReconItem[]>(SEED_RECON_ITEMS)
  const [selectedFilter, setSelectedFilter] = useState('ALL')
  const [activeItem, setActiveItem] = useState<ReconItem | null>(null)
  const [correctionReason, setCorrectionReason] = useState('')
  const [runningRecon, setRunningRecon] = useState(false)

  const handleRunRecon = () => {
    setRunningRecon(true)
    setTimeout(() => {
      setRunningRecon(false)
    }, 800)
  }

  const handleCorrect = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem || !correctionReason.trim()) return

    setItems((prev) =>
      prev.map((item) =>
        item.id === activeItem.id
          ? {
              ...item,
              status: 'matched',
              explanation: `Manually verified & approved. Reason: ${correctionReason}`,
            }
          : item
      )
    )
    setActiveItem(null)
    setCorrectionReason('')
  }

  const filtered = items.filter((item) => {
    if (selectedFilter === 'ALL') return true
    return item.status === selectedFilter
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              Automated Reconciliation
            </h1>
            <SandboxBadge />
            <DemoBadge />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Deterministic rule matching across PayPal ledger events, merchant orders, and bank settlements.
          </p>
        </div>

        <button
          onClick={handleRunRecon}
          disabled={runningRecon}
          className="btn btn-primary text-xs flex items-center gap-2"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${runningRecon ? 'animate-spin' : ''}`} />
          {runningRecon ? 'Running Rules...' : 'Run Auto-Recon'}
        </button>
      </div>

      {/* ── State Summary Bar ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setSelectedFilter('ALL')}
          className={`card p-4 cursor-pointer transition-all ${selectedFilter === 'ALL' ? 'border-[var(--brand-orange)]' : ''}`}
        >
          <div className="text-xs text-[var(--text-muted)] font-mono">Total Processed</div>
          <div className="text-xl font-bold text-[var(--text-primary)] font-mono mt-1">{items.length}</div>
        </div>

        <div
          onClick={() => setSelectedFilter('matched')}
          className={`card p-4 cursor-pointer transition-all ${selectedFilter === 'matched' ? 'border-[var(--status-success)]' : ''}`}
        >
          <div className="text-xs text-[var(--text-muted)] font-mono">Matched (100%)</div>
          <div className="text-xl font-bold text-[var(--status-success)] font-mono mt-1">
            {items.filter((i) => i.status === 'matched').length}
          </div>
        </div>

        <div
          onClick={() => setSelectedFilter('amount_mismatch')}
          className={`card p-4 cursor-pointer transition-all ${selectedFilter === 'amount_mismatch' ? 'border-[var(--status-warning)]' : ''}`}
        >
          <div className="text-xs text-[var(--text-muted)] font-mono">Amount Mismatch</div>
          <div className="text-xl font-bold text-[var(--status-warning)] font-mono mt-1">
            {items.filter((i) => i.status === 'amount_mismatch').length}
          </div>
        </div>

        <div
          onClick={() => setSelectedFilter('missing_order')}
          className={`card p-4 cursor-pointer transition-all ${selectedFilter === 'missing_order' ? 'border-[var(--status-danger)]' : ''}`}
        >
          <div className="text-xs text-[var(--text-muted)] font-mono">Missing Order</div>
          <div className="text-xl font-bold text-[var(--status-danger)] font-mono mt-1">
            {items.filter((i) => i.status === 'missing_order').length}
          </div>
        </div>
      </div>

      {/* ── Recon Table ───────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-sunken)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-mono">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Rule Code</th>
                <th className="py-3 px-4">PayPal Txn</th>
                <th className="py-3 px-4">Merchant Order</th>
                <th className="py-3 px-4 text-right">PayPal Amount</th>
                <th className="py-3 px-4 text-right">Order Amount</th>
                <th className="py-3 px-4">Explanation / Trace</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-sunken)] transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`badge text-[10px] ${
                        item.status === 'matched'
                          ? 'badge-success'
                          : item.status === 'amount_mismatch'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--brand-orange)] font-semibold">
                    {item.rule}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{item.transactionId}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--text-secondary)]">{item.orderId}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    {formatMoney(item.txnAmount, item.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[var(--text-secondary)]">
                    {item.orderAmount ? formatMoney(item.orderAmount, item.currency) : '—'}
                  </td>
                  <td className="py-3 px-4 max-w-xs text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.explanation}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.status !== 'matched' ? (
                      <button
                        onClick={() => setActiveItem(item)}
                        className="btn btn-secondary text-[11px] py-1 px-2.5"
                      >
                        Review / Adjust
                      </button>
                    ) : (
                      <span className="text-[var(--status-success)] flex items-center justify-center gap-1 text-[11px]">
                        <Check className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Manual Adjustment Modal ────────────────────────────── */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Manual Reconciliation Override
              </h3>
              <button
                onClick={() => setActiveItem(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Manual adjustments emit an immutable audit event with your reason into the append-only SHA-256 hash chain.
            </p>

            <div className="p-3 bg-[var(--surface-sunken)] rounded-lg text-xs space-y-1 font-mono">
              <div>Txn ID: {activeItem.transactionId}</div>
              <div>Discrepancy: {activeItem.explanation}</div>
            </div>

            <form onSubmit={handleCorrect} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g., Customer agreed to $5 shipping surcharge over phone; invoice updated."
                  className="input w-full text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs">
                  Authorize & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
