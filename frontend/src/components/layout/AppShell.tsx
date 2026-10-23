import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileWarning,
  ShieldCheck,
  Clock,
  ScrollText,
  Sparkles,
  Settings,
  FlaskConical,
} from 'lucide-react'
import SandboxBadge from '../SandboxBadge'

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/reconciliation', icon: ArrowLeftRight, label: 'Reconciliation' },
  { to: '/app/disputes', icon: FileWarning, label: 'Disputes' },
  { to: '/app/deadlines', icon: Clock, label: 'Deadlines' },
  { to: '/app/audit', icon: ScrollText, label: 'Audit Trail' },
  { to: '/app/ask', icon: Sparkles, label: 'Ask Lucentra' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
] as const

const isSandbox = import.meta.env.VITE_SANDBOX_MODE === 'true'

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ── Left sidebar ─────────────────────────────────────── */}
      <aside
        className="flex flex-col w-60 shrink-0 border-r"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Wordmark */}
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '1.5rem',
              color: 'var(--brand)',
              letterSpacing: '-0.04em',
            }}
          >
            Lucentra
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-luc-brand/10'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--brand-strong)', color: '#fff' }
                  : { color: 'var(--ink-muted)' }
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          {isSandbox && (
            <NavLink
              to="/app/sandbox"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mt-4 border ${
                  isActive ? 'text-white' : ''
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' }
                  : { color: 'var(--brand)', borderColor: 'var(--brand)', background: 'var(--brand-subtle)' }
              }
            >
              <FlaskConical size={16} />
              Sandbox Tools
            </NavLink>
          )}
        </nav>
      </aside>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div />
          <div className="flex items-center gap-3">
            <SandboxBadge />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
