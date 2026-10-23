import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'
import DemoBadge from '../components/DemoBadge'
import { formatMoney } from '../lib/money'

interface DeadlineItem {
  id: string
  disputeId: string
  amountMinor: number
  currency: string
  reason: string
  dueDate: string
  isProviderConfirmed: boolean
  hasMissingEvidence: boolean
}

const SEED_DEADLINES: DeadlineItem[] = [
  {
    id: 'd1',
    disputeId: 'PP-D-12849',
    amountMinor: 45000,
    currency: 'USD',
    reason: 'UNAUTHORIZED_TRANSACTION',
    dueDate: '2026-10-24T20:00:00Z',
    isProviderConfirmed: true,
    hasMissingEvidence: false,
  },
  {
    id: 'd2',
    disputeId: 'PP-D-99120',
    amountMinor: 44000,
    currency: 'USD',
    reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    dueDate: '2026-10-26T12:00:00Z',
    isProviderConfirmed: true,
    hasMissingEvidence: true,
  },
  {
    id: 'd3',
    disputeId: 'PP-D-33019',
    amountMinor: 11000,
    currency: 'USD',
    reason: 'CANCELLED_RECURRING_BILLING',
    dueDate: '2026-10-29T18:00:00Z',
    isProviderConfirmed: true,
    hasMissingEvidence: false,
  },
]

export default function Deadlines() {
  const [deadlines] = useState<DeadlineItem[]>(SEED_DEADLINES)
  const [filterMissing, setFilterMissing] = useState(false)

  const now = new Date()

  const getUrgency = (dueDate: string) => {
    const diffHours = (new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60)
    if (diffHours < 24) return { label: 'CRITICAL (<24h)', class: 'badge-danger' }
    if (diffHours < 72) return { label: 'HIGH (<72h)', class: 'badge-warning' }
    return { label: 'NORMAL', class: 'badge-neutral' }
  }

  const filtered = deadlines.filter((d) => {
    if (filterMissing && !d.hasMissingEvidence) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              Dispute Deadlines Manager
            </h1>
            <SandboxBadge />
            <DemoBadge />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Official deadlines provided directly by the PayPal Customer Disputes API. Never fabricated or guessed.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)] font-medium">
          <input
            type="checkbox"
            checked={filterMissing}
            onChange={(e) => setFilterMissing(e.target.checked)}
            className="rounded border-[var(--border-subtle)] text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]"
          />
          Show Only Missing Evidence
        </label>
      </div>

      {/* Deadlines List */}
      <div className="space-y-4">
        {filtered.map((d) => {
          const urgency = getUrgency(d.dueDate)
          return (
            <div
              key={d.id}
              className="card p-5 border border-[var(--border-subtle)] hover:border-[var(--brand-orange)] transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-[var(--brand-orange)]">
                      {d.disputeId}
                    </span>
                    <span className={`badge text-xs font-mono font-semibold ${urgency.class}`}>
                      {urgency.label}
                    </span>
                    {d.isProviderConfirmed && (
                      <span className="badge badge-neutral text-[10px]">
                        Provider-Confirmed Deadline
                      </span>
                    )}
                    {d.hasMissingEvidence && (
                      <span className="text-xs text-[var(--status-danger)] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missing Proof
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {d.reason} •{' '}
                    <span className="font-mono text-xs">
                      {formatMoney(d.amountMinor, d.currency)}
                    </span>
                  </div>

                  <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>
                      Seller Response Due:{' '}
                      <strong>{new Date(d.dueDate).toLocaleString()}</strong>
                    </span>
                  </div>
                </div>

                <Link
                  to={`/app/disputes/${d.disputeId}/evidence`}
                  className="btn btn-primary text-xs flex items-center gap-1.5"
                >
                  Compile Defense
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
