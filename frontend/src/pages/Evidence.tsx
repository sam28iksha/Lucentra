import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Send,
  ShieldCheck,
  FileText,
  Clock,
  ArrowLeft,
  Check,
  AlertTriangle,
} from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'
import DemoBadge from '../components/DemoBadge'
import { formatMoney } from '../lib/money'

export default function Evidence() {
  const { disputeId = 'PP-D-12849' } = useParams()
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [generating, setGenerating] = useState(false)

  const draft = {
    disputeId,
    category: 'UNAUTHORIZED_TRANSACTION',
    amountMinor: 45000,
    currency: 'USD',
    dueDate: '2026-10-24T20:00:00Z',
    completenessScore: 94,
    plainSummary:
      'Buyer claims account takeover. Merchant records show order placed from verified IP matching prior history, shipped via FedEx with signature confirmation to verified billing address.',
    evidenceChecklist: [
      { text: 'Proof of Delivery (FedEx 920194820192) signed by buyer', ok: true },
      { text: 'Verified IP address match across 3 prior purchases', ok: true },
      { text: 'Itemized merchant invoice (INV-2026-8801)', ok: true },
      { text: 'Customer service correspondence logs', ok: true },
      { text: 'Device fingerprint biometric authentication audit', ok: false },
    ],
    claims: [
      {
        id: 'c1',
        text: 'Goods were delivered to the buyer’s confirmed address on Oct 23, 2026, and physically signed for.',
        sources: ['FEDEX-POD-920194820192', 'TXN-9XY82190KV829102X'],
        type: 'verified_fact',
        supported: true,
      },
      {
        id: 'c2',
        text: 'Transaction IP 198.51.100.4 matches previous completed purchase INV-2026-7719 from June 2026.',
        sources: ['IP-AUDIT-LOG-8801'],
        type: 'verified_fact',
        supported: true,
      },
      {
        id: 'c3',
        text: 'Buyer submitted no communication reporting unauthorized access prior to dispute filing.',
        sources: ['ZENDESK-TICKET-SEARCH'],
        type: 'merchant_statement',
        supported: true,
      },
      {
        id: 'c4',
        text: 'Buyer might have authorized a household member to complete the transaction without notification.',
        sources: [],
        type: 'ai_suggestion',
        supported: false, // Flagged because no hard source proof in DB!
      },
    ],
    draftLetter: `Dear PayPal Dispute Resolution Team,

We are submitting formal seller response and compelling evidence regarding Dispute ${disputeId} (Unauthorized Transaction claim).

SUMMARY OF EVIDENCE:
1. Proof of Delivery: The merchandise was dispatched via FedEx (Tracking #920194820192) to the confirmed address listed on the PayPal transaction record. The package was signed and delivered on Oct 23, 2026.
2. Verified Customer Order: Order INV-2026-8801 was placed using the buyer's recognized device and IP address (198.51.100.4), identical to 3 prior legitimate transactions.
3. No Report of Theft: No inquiries or reports of account theft were made to our support prior to the chargeback.

In accordance with PayPal Seller Protection guidelines for tangible items delivered to the verified address with valid signature confirmation, we respectfully request this dispute be resolved in the merchant's favor.

All underlying documentation has been compiled and cryptographically signed.

Sincerely,
Merchant Operations Team`,
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(draft.draftLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitEvidence = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          to="/app/disputes"
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dispute Operations
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              AI Evidence Builder
            </h1>
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--brand-orange)]">
              {disputeId}
            </span>
            <SandboxBadge />
            <DemoBadge />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Ground-truth claims mapped to source records. Deterministic validator prevents unsupported assertions.
          </p>
        </div>

        <button
          onClick={() => {
            setGenerating(true)
            setTimeout(() => setGenerating(false), 1000)
          }}
          disabled={generating}
          className="btn btn-secondary text-xs flex items-center gap-2"
        >
          <Sparkles className={`w-3.5 h-3.5 text-[var(--brand-orange)] ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Compiling Ground Truth...' : 'Regenerate Draft'}
        </button>
      </div>

      {/* Prominent Safety Notice */}
      <div className="p-4 rounded-xl border border-[rgba(255,138,51,0.3)] bg-[rgba(255,138,51,0.06)] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--brand-orange)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-[var(--text-primary)]">Safety & Compliance Notice:</strong>{' '}
          Lucentra does not guarantee dispute outcomes. AI drafts must be reviewed and confirmed by an authorized reviewer.
          Unsupported claims are highlighted in red and cannot be automatically submitted to PayPal.
        </div>
      </div>

      {/* Main 3-Column / 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Evidence Checklist & Claims */}
        <div className="lg:col-span-2 space-y-6">
          {/* Readiness Score Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Evidence Completeness Score
              </h3>
              <span className="text-lg font-bold font-mono text-[var(--status-success)]">
                {draft.completenessScore}%
              </span>
            </div>
            <div className="w-full bg-[var(--surface-sunken)] h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-[var(--status-success)] h-full transition-all duration-500"
                style={{ width: `${draft.completenessScore}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {draft.plainSummary}
            </p>
          </div>

          {/* Checklist */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Seller Protection Requirements
            </h3>
            <div className="space-y-2">
              {draft.evidenceChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-sunken)] text-xs"
                >
                  <span className="text-[var(--text-primary)]">{item.text}</span>
                  {item.ok ? (
                    <span className="text-[var(--status-success)] flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Available
                    </span>
                  ) : (
                    <span className="text-[var(--status-warning)] flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" /> Missing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Claim-to-Source Mapping Panel */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Claim-to-Source Validation Matrix
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Validated Deterministically
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Every sentence submitted is tagged and audited against real database ledger rows.
            </p>

            <div className="space-y-3 pt-2">
              {draft.claims.map((claim) => (
                <div
                  key={claim.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    claim.supported
                      ? 'border-[var(--border-subtle)] bg-[var(--surface-sunken)]'
                      : 'border-[var(--status-danger)] bg-[rgba(239,68,68,0.05)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge text-[10px] uppercase font-mono ${
                          claim.type === 'verified_fact'
                            ? 'badge-success'
                            : claim.type === 'merchant_statement'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {claim.type.replace('_', ' ')}
                      </span>
                    </div>

                    {claim.supported ? (
                      <span className="text-[var(--status-success)] font-mono text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Grounded in Records
                      </span>
                    ) : (
                      <span className="text-[var(--status-danger)] font-mono text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Unsupported Suggestion
                      </span>
                    )}
                  </div>

                  <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                    &ldquo;{claim.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-[var(--text-muted)]">
                    <span>Source IDs:</span>
                    {claim.sources.length > 0 ? (
                      claim.sources.map((src, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--brand-orange)]">
                          {src}
                        </span>
                      ))
                    ) : (
                      <span className="text-[var(--status-danger)] italic">None (AI speculation)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Formal Response Letter & Approval */}
        <div className="space-y-6">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Compiled Defense Letter
              </h3>
              <button
                onClick={handleCopy}
                className="btn btn-secondary text-[11px] py-1 px-2 flex items-center gap-1.5"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="p-3 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {draft.draftLetter}
            </div>

            {/* Merchant Authorization Checkbox */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--border-subtle)] text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]"
                />
                <span>
                  I have verified all supporting documents and confirm the accuracy of this evidence submission.
                </span>
              </label>

              <button
                onClick={handleSubmitEvidence}
                disabled={!confirmed || submitting || submitted}
                className="btn btn-primary w-full text-xs flex items-center justify-center gap-2 py-2.5"
              >
                <Send className={`w-3.5 h-3.5 ${submitting ? 'animate-spin' : ''}`} />
                {submitted
                  ? 'Submitted to PayPal (Mock/Sandbox)'
                  : submitting
                  ? 'Transmitting Evidence...'
                  : 'Approve & Submit Evidence'}
              </button>

              {submitted && (
                <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[var(--status-success)] text-xs text-[var(--status-success)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Evidence recorded and immutable hash chain extended!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
