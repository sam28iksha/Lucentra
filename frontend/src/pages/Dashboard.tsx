import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
} from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'
import DemoBadge from '../components/DemoBadge'
import { formatMoney } from '../lib/money'

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    activeDisputes: 3,
    disputedVolumeMinor: 142500, // $1,425.00
    atRiskDeadlineVolumeMinor: 89000, // $890.00
    reconciliationRate: 98.4,
    unreconciledCount: 4,
    unreconciledMinor: 23400,
    winRate: 84.6,
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              Revenue Command Center
            </h1>
            <SandboxBadge />
            <DemoBadge />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time protection overview, upcoming dispute deadlines, and reconciliation integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoading(!loading)}
            className="btn btn-secondary text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Signals
          </button>
          <Link to="/app/reconciliation" className="btn btn-primary text-xs flex items-center gap-2">
            Run Auto-Recon
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card p-5 relative overflow-hidden group hover:border-[var(--brand-orange)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">
            <span>Disputed Volume</span>
            <ShieldAlert className="w-4 h-4 text-[var(--brand-orange)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {formatMoney(stats.disputedVolumeMinor, 'USD')}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--brand-orange)]"></span>
            <span>{stats.activeDisputes} open dispute cases</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card p-5 relative overflow-hidden group hover:border-[var(--status-danger)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">
            <span>Critical Deadlines (&lt;72h)</span>
            <Clock className="w-4 h-4 text-[var(--status-danger)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--status-danger)]">
            {formatMoney(stats.atRiskDeadlineVolumeMinor, 'USD')}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-[var(--text-secondary)]">
            <span>2 submissions required</span>
            <Link to="/app/deadlines" className="text-[var(--brand-orange)] hover:underline flex items-center gap-0.5">
              Review <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card p-5 relative overflow-hidden group hover:border-[var(--status-warning)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">
            <span>Unreconciled Pipeline</span>
            <AlertTriangle className="w-4 h-4 text-[var(--status-warning)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {formatMoney(stats.unreconciledMinor, 'USD')}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-[var(--text-secondary)]">
            <span>{stats.unreconciledCount} transactions pending</span>
            <Link to="/app/reconciliation" className="text-[var(--brand-orange)] hover:underline flex items-center gap-0.5">
              Resolve <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card p-5 relative overflow-hidden group hover:border-[var(--status-success)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mb-2">
            <span>Reconciliation Match Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {stats.reconciliationRate}%
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5 text-[var(--status-success)]">
            <span>Audit hash chain intact (0 breaks)</span>
          </div>
        </div>
      </div>

      {/* ── Actionable Sections ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Attention Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Action Required: High-Risk Disputes
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  AI evidence drafted and verified against PayPal transaction history.
                </p>
              </div>
              <Link to="/app/disputes" className="text-xs text-[var(--brand-orange)] font-medium hover:underline flex items-center gap-1">
                View all disputes <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-danger text-xs font-mono">PP-D-12849</span>
                    <span className="text-xs text-[var(--status-danger)] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 18 hours left
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">Unauthorized Transaction</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    Dispute for $450.00 USD • Customer: alex.t@example.com
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                    <span>Evidence readiness: <strong className="text-[var(--status-success)]">94% complete</strong></span>
                    <span>•</span>
                    <span className="text-[var(--brand-orange)]">Tracking proof linked</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/app/disputes/PP-D-12849/evidence"
                    className="btn btn-primary text-xs py-1.5 px-3"
                  >
                    Review AI Pack
                  </Link>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-warning text-xs font-mono">PP-D-99120</span>
                    <span className="text-xs text-[var(--status-warning)] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 48 hours left
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">Item Not Received</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    Dispute for $440.00 USD • Customer: sarah.m@retail.co
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                    <span>Evidence readiness: <strong className="text-[var(--brand-orange)]">72% complete</strong></span>
                    <span>•</span>
                    <span className="text-[var(--status-warning)]">Missing delivery signature</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/app/disputes/PP-D-99120/evidence"
                    className="btn btn-secondary text-xs py-1.5 px-3"
                  >
                    Review AI Pack
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,138,51,0.12)] flex items-center justify-center shrink-0 text-[var(--brand-orange)]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                Cryptographic Audit Hash Chain Active
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Every dispute evidence pack and reconciliation adjustment is recorded in an append-only SHA-256 hash chain with cryptographic proofs to ensure compliance and prevent tampered records.
              </p>
              <div className="pt-1">
                <Link to="/app/audit" className="text-xs font-medium text-[var(--brand-orange)] hover:underline inline-flex items-center gap-1">
                  Verify full chain integrity <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Assistant & System Status */}
        <div className="space-y-6">
          {/* Ask Lucentra Mini */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Ask Lucentra AI
              </h3>
              <span className="badge badge-neutral text-[10px]">Deterministic SQL</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Query disputes, settlement discrepancies, and fee anomalies in natural language.
            </p>
            <div className="space-y-2">
              <Link
                to="/app/ask?q=Why did unreconciled amount increase this week?"
                className="block p-2.5 rounded-lg bg-[var(--surface-sunken)] hover:bg-[var(--border-subtle)] text-xs text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
              >
                &ldquo;Why did unreconciled volume increase this week?&rdquo;
              </Link>
              <Link
                to="/app/ask?q=Show all disputes expiring in next 48 hours"
                className="block p-2.5 rounded-lg bg-[var(--surface-sunken)] hover:bg-[var(--border-subtle)] text-xs text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
              >
                &ldquo;Show disputes expiring in next 48 hours&rdquo;
              </Link>
            </div>
            <Link to="/app/ask" className="btn btn-secondary w-full text-xs text-center justify-center">
              Open Full AI Assistant
            </Link>
          </div>

          {/* Sandbox Credentials & State */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)]">PayPal Sandbox Sync</span>
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)]"></span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="text-[var(--text-primary)]">api-m.sandbox.paypal.com</span>
              </div>
              <div className="flex justify-between">
                <span>Token Status:</span>
                <span className="text-[var(--status-success)]">Valid (cached)</span>
              </div>
              <div className="flex justify-between">
                <span>Reporting Window:</span>
                <span className="text-[var(--text-primary)]">31 days / request</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
