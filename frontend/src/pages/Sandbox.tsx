import { useState } from 'react'
import { TestTube2, AlertTriangle, Play, CheckCircle2, ShieldAlert } from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'

export default function Sandbox() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<string | null>(null)

  const handleAction = async (endpoint: string, actionName: string) => {
    setLoadingAction(actionName)
    try {
      const res = await fetch(`/api/sandbox/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      setLastResponse(JSON.stringify(data, null, 2))
    } catch (e: any) {
      setLastResponse(JSON.stringify({ error: e.message }, null, 2))
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              Sandbox Simulation Center
            </h1>
            <span className="badge badge-warning text-xs font-mono font-bold uppercase">
              SANDBOX ONLY
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Trigger dispute state transitions and require evidence directly using PayPal Sandbox endpoints.
          </p>
        </div>
      </div>

      {/* Prominent Warning */}
      <div className="p-4 rounded-xl border border-[var(--status-warning)] bg-[rgba(245,158,11,0.06)] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--status-warning)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-[var(--text-primary)]">Developer Environment Only:</strong>{' '}
          These endpoints only execute against PayPal Sandbox (<code>api-m.sandbox.paypal.com</code>). They simulate merchant-initiated dispute generation and adjudication lifecycles.
        </div>
      </div>

      {/* Sandbox Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tool 1 */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TestTube2 className="w-4 h-4 text-[var(--brand-orange)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Create Mock Dispute
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Generates a test dispute on PayPal sandbox linked to a recent test capture.
          </p>
          <button
            onClick={() => handleAction('create-dispute', 'create')}
            disabled={loadingAction === 'create'}
            className="btn btn-secondary w-full text-xs flex items-center justify-center gap-2"
          >
            <Play className={`w-3.5 h-3.5 ${loadingAction === 'create' ? 'animate-spin' : ''}`} />
            {loadingAction === 'create' ? 'Creating...' : 'Trigger Creation'}
          </button>
        </div>

        {/* Tool 2 */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--status-danger)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Require Evidence
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Moves an open dispute into <code>WAITING_FOR_SELLER_RESPONSE</code> state with a deadline.
          </p>
          <button
            onClick={() => handleAction('require-evidence', 'require')}
            disabled={loadingAction === 'require'}
            className="btn btn-secondary w-full text-xs flex items-center justify-center gap-2"
          >
            <Play className={`w-3.5 h-3.5 ${loadingAction === 'require' ? 'animate-spin' : ''}`} />
            {loadingAction === 'require' ? 'Transitioning...' : 'Require Evidence'}
          </button>
        </div>

        {/* Tool 3 */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Adjudicate (Win/Loss)
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Simulates PayPal agent adjudication to resolve the dispute in favor of merchant.
          </p>
          <button
            onClick={() => handleAction('adjudicate', 'adjudicate')}
            disabled={loadingAction === 'adjudicate'}
            className="btn btn-secondary w-full text-xs flex items-center justify-center gap-2"
          >
            <Play className={`w-3.5 h-3.5 ${loadingAction === 'adjudicate' ? 'animate-spin' : ''}`} />
            {loadingAction === 'adjudicate' ? 'Resolving...' : 'Simulate Resolve'}
          </button>
        </div>
      </div>

      {/* Output Console */}
      {lastResponse && (
        <div className="card p-5 space-y-2">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] font-mono">
            Sandbox Response Payload
          </h3>
          <pre className="p-3 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--brand-orange)] overflow-x-auto">
            {lastResponse}
          </pre>
        </div>
      )}
    </div>
  )
}
