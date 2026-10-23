import { useState } from 'react'
import { Shield, Key, Database, Bell, CheckCircle2 } from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'

export default function Settings() {
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              System Settings & Integrations
            </h1>
            <SandboxBadge />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure PayPal developer credentials, webhook listener tunnels, and AI inference provider.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PayPal Credentials Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
            <Key className="w-4 h-4 text-[var(--brand-orange)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              PayPal Developer Sandbox
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                PayPal Client ID
              </label>
              <input
                type="text"
                readOnly
                value="Ab123... (Configured via backend .env)"
                className="input w-full font-mono text-xs bg-[var(--surface-sunken)] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                PayPal Client Secret
              </label>
              <input
                type="password"
                readOnly
                value="••••••••••••••••••••••••"
                className="input w-full font-mono text-xs bg-[var(--surface-sunken)] cursor-not-allowed"
              />
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                Never shared with the browser. Kept securely on backend memory.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Webhook ID
              </label>
              <input
                type="text"
                readOnly
                value="WH-99182... (Active listener)"
                className="input w-full font-mono text-xs bg-[var(--surface-sunken)] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI Model Configuration */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
            <Shield className="w-4 h-4 text-[var(--brand-orange)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              AI Provider & Deterministic Guardrails
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Active Model
              </label>
              <select className="input w-full text-xs" defaultValue="claude-3-5-sonnet">
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Default)</option>
                <option value="gpt-4o">OpenAI GPT-4o (Fallback)</option>
              </select>
            </div>

            <div className="p-3 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
              <div className="font-semibold text-[var(--text-primary)]">Deterministic Extraction Active:</div>
              <div>Claims are strictly matched against ingested ledger transaction IDs and delivery tracking APIs.</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-[var(--status-success)] flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Preferences Saved
            </span>
          )}
          <button type="submit" className="btn btn-primary text-xs px-5 py-2">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
