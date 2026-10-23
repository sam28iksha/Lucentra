import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'
import DemoBadge from '../components/DemoBadge'
import { formatMoney } from '../lib/money'

interface DisputeRow {
  disputeId: string
  buyerTxnId: string
  amountMinor: number
  currency: string
  reason: string
  status: string
  dueDate?: string
  stage: string
  completenessScore: number
  evidenceStatus: 'ready' | 'missing_items' | 'submitted'
}

const SEED_DISPUTES: DisputeRow[] = [
  {
    disputeId: 'PP-D-12849',
    buyerTxnId: '9XY82190KV829102X',
    amountMinor: 45000,
    currency: 'USD',
    reason: 'UNAUTHORIZED_TRANSACTION',
    status: 'WAITING_FOR_SELLER_RESPONSE',
    dueDate: '2026-10-24T20:00:00Z',
    stage: 'CHARGEBACK',
    completenessScore: 94,
    evidenceStatus: 'ready',
  },
  {
    disputeId: 'PP-D-99120',
    buyerTxnId: '7KL81920PP019284M',
    amountMinor: 44000,
    currency: 'USD',
    reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    status: 'WAITING_FOR_SELLER_RESPONSE',
    dueDate: '2026-10-26T12:00:00Z',
    stage: 'CLAIM',
    completenessScore: 72,
    evidenceStatus: 'missing_items',
  },
  {
    disputeId: 'PP-D-77319',
    buyerTxnId: '3BB88192QQ102938B',
    amountMinor: 18500,
    currency: 'USD',
    reason: 'NOT_AS_DESCRIBED',
    status: 'UNDER_REVIEW',
    dueDate: undefined,
    stage: 'INQUIRY',
    completenessScore: 100,
    evidenceStatus: 'submitted',
  },
]

export default function Disputes() {
  const [disputes] = useState<DisputeRow[]>(SEED_DISPUTES)
  const [filter, setFilter] = useState('ALL')

  const filtered = disputes.filter((d) => {
    if (filter === 'ALL') return true
    if (filter === 'URGENT') return !!d.dueDate
    return d.status === filter
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              Dispute Operations
            </h1>
            <SandboxBadge />
            <DemoBadge />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time sync with PayPal Customer Disputes API (<code>/v1/customer/disputes</code>) & automated evidence compilation.
          </p>
        </div>

        <button className="btn btn-secondary text-xs flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Poll Disputes API
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'ALL'
              ? 'bg-[var(--surface-raised)] text-[var(--brand-orange)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          All Disputes ({disputes.length})
        </button>
        <button
          onClick={() => setFilter('WAITING_FOR_SELLER_RESPONSE')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'WAITING_FOR_SELLER_RESPONSE'
              ? 'bg-[var(--surface-raised)] text-[var(--brand-orange)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Waiting for Response ({disputes.filter((d) => d.status === 'WAITING_FOR_SELLER_RESPONSE').length})
        </button>
        <button
          onClick={() => setFilter('URGENT')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'URGENT'
              ? 'bg-[var(--surface-raised)] text-[var(--status-danger)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Urgent Deadlines
        </button>
      </div>

      {/* Disputes Cards / Table */}
      <div className="space-y-4">
        {filtered.map((d) => (
          <div
            key={d.disputeId}
            className="card p-6 border border-[var(--border-subtle)] hover:border-[var(--brand-orange)] transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[var(--brand-orange)]">
                    {d.disputeId}
                  </span>
                  <span className="badge badge-neutral text-xs font-mono">{d.stage}</span>
                  <span
                    className={`badge text-xs ${
                      d.status === 'WAITING_FOR_SELLER_RESPONSE'
                        ? 'badge-warning'
                        : 'badge-success'
                    }`}
                  >
                    {d.status.replace(/_/g, ' ')}
                  </span>
                  {d.dueDate && (
                    <span className="text-xs text-[var(--status-danger)] font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due by {new Date(d.dueDate).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="text-base font-semibold text-[var(--text-primary)]">
                  Dispute Reason: <span className="font-mono text-sm">{d.reason}</span>
                </div>

                <div className="text-xs text-[var(--text-secondary)] flex flex-wrap items-center gap-4">
                  <span>
                    Disputed Amount:{' '}
                    <strong className="text-[var(--text-primary)] font-mono">
                      {formatMoney(d.amountMinor, d.currency)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Linked Transaction:{' '}
                    <code className="text-[var(--brand-orange)]">{d.buyerTxnId}</code>
                  </span>
                </div>
              </div>

              {/* Action Buttons & Readiness */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-right sm:pr-4 sm:border-r border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">
                    AI Pack Readiness
                  </div>
                  <div className="text-lg font-bold font-mono text-[var(--status-success)]">
                    {d.completenessScore}%
                  </div>
                </div>

                <Link
                  to={`/app/disputes/${d.disputeId}/evidence`}
                  className="btn btn-primary text-xs flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Build & Review Evidence
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
