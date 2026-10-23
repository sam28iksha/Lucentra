import { useState, useEffect } from 'react'
import { RefreshCw, Download, Search, CheckCircle, AlertCircle } from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'
import DemoBadge from '../components/DemoBadge'
import { formatMoney } from '../lib/money'
import { api, Transaction } from '../lib/api'

// Seed transactions to showcase if backend is cold/fresh
const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_001',
    transaction_id: '9XY82190KV829102X',
    transaction_event_code: 'T0006',
    transaction_initiation_date: '2026-10-22T14:32:00Z',
    gross_amount: 45000,
    fee_amount: 1435,
    net_amount: 43565,
    currency: 'USD',
    transaction_status: 'S',
    payer_email: 'alex.t@example.com',
    payer_name: 'Alex Turner',
    invoice_id: 'INV-2026-8801',
    is_demo: true,
  },
  {
    id: 'txn_002',
    transaction_id: '4PL10294MM918274L',
    transaction_event_code: 'T0000',
    transaction_initiation_date: '2026-10-21T09:15:30Z',
    gross_amount: 12500,
    fee_amount: 420,
    net_amount: 12080,
    currency: 'USD',
    transaction_status: 'S',
    payer_email: 'maria.g@business.net',
    payer_name: 'Maria Garcia',
    invoice_id: 'INV-2026-8802',
    is_demo: true,
  },
  {
    id: 'txn_003',
    transaction_id: '8HJ72019QQ381920Z',
    transaction_event_code: 'T0000',
    transaction_initiation_date: '2026-10-20T18:40:12Z',
    gross_amount: 8900,
    fee_amount: 310,
    net_amount: 8590,
    currency: 'USD',
    transaction_status: 'S',
    payer_email: 'jonas.k@cloudworks.io',
    payer_name: 'Jonas Khan',
    invoice_id: 'INV-2026-8799',
    is_demo: true,
  },
  {
    id: 'txn_004',
    transaction_id: '2KL99182BB102938A',
    transaction_event_code: 'T1107',
    transaction_initiation_date: '2026-10-19T11:05:44Z',
    gross_amount: -4500,
    fee_amount: 0,
    net_amount: -4500,
    currency: 'USD',
    transaction_status: 'S',
    payer_email: 'alex.t@example.com',
    payer_name: 'Alex Turner',
    invoice_id: 'INV-2026-8801',
    is_demo: true,
  },
]

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const data = await api.getTransactions()
      if (data.transactions && data.transactions.length > 0) {
        setTransactions(data.transactions)
      }
    } catch {
      // Fallback to seed data
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await api.syncTransactions()
      await fetchTransactions()
    } catch {
      // Keep state
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.payer_email && t.payer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.invoice_id && t.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()))

    if (statusFilter === 'ALL') return matchesSearch
    return matchesSearch && t.transaction_status === statusFilter
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              PayPal Transactions
            </h1>
            <SandboxBadge />
            <DemoBadge />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Normalized ledger records from PayPal Transaction Search (<code>/v1/reporting/transactions</code>).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-secondary text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Sandbox'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Txn ID, Payer, or Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[var(--text-muted)] font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-xs py-1.5"
          >
            <option value="ALL">All Statuses</option>
            <option value="S">Completed (S)</option>
            <option value="P">Pending (P)</option>
            <option value="V">Reversed (V)</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-sunken)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-mono">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date (UTC)</th>
                <th className="py-3 px-4">Event Code</th>
                <th className="py-3 px-4">Payer / Source</th>
                <th className="py-3 px-4 text-right">Gross</th>
                <th className="py-3 px-4 text-right">Fee</th>
                <th className="py-3 px-4 text-right">Net</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)] font-mono">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--surface-sunken)] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[var(--brand-orange)]">
                    {t.transaction_id}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {new Date(t.transaction_initiation_date).toLocaleDateString()}{' '}
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(t.transaction_initiation_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-neutral text-[10px]">{t.transaction_event_code}</span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-medium text-[var(--text-primary)]">{t.payer_name || 'Anonymous'}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{t.payer_email}</div>
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${t.gross_amount < 0 ? 'text-[var(--status-danger)]' : ''}`}>
                    {formatMoney(t.gross_amount, t.currency)}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--text-muted)]">
                    {formatMoney(t.fee_amount, t.currency)}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${t.net_amount < 0 ? 'text-[var(--status-danger)]' : 'text-[var(--status-success)]'}`}>
                    {formatMoney(t.net_amount, t.currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge ${t.transaction_status === 'S' ? 'badge-success' : 'badge-warning'} text-[10px]`}>
                      {t.transaction_status === 'S' ? 'Success' : t.transaction_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {t.is_demo ? <DemoBadge /> : <SandboxBadge />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            No transactions found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
