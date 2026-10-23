import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Sparkles, Terminal, Database, CheckCircle2, Bot, User } from 'lucide-react'
import SandboxBadge from '../components/SandboxBadge'
import DemoBadge from '../components/DemoBadge'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  content: string
  sql?: string
  records?: Array<Record<string, any>>
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'assistant',
    content:
      'Hello! I am your Lucentra AI intelligence partner. Ask me questions about PayPal disputes, fee discrepancies, or unreconciled cash flow.',
  },
]

export default function AskLucentra() {
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      handleAsk(q)
    }
  }, [searchParams])

  const handleAsk = (queryText: string) => {
    if (!queryText.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: queryText,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate deterministic query response
    setTimeout(() => {
      let aiContent = ''
      let sql = ''
      let records: any[] = []

      if (queryText.toLowerCase().includes('unreconciled') || queryText.toLowerCase().includes('increase')) {
        sql = `SELECT r.match_status, count(*), sum(t.gross_amount) 
FROM recon_results r 
JOIN transactions t ON r.transaction_id = t.transaction_id 
WHERE r.match_status != 'matched' 
GROUP BY r.match_status;`
        aiContent =
          'Unreconciled volume rose by $234.00 USD this week due to 2 unlinked payments without merchant invoice references (event code T0000) and 1 transaction with a $5.00 shipping surcharge variance.'
        records = [
          { status: 'amount_mismatch', count: 1, sum_usd: '$125.00' },
          { status: 'missing_order', count: 2, sum_usd: '$89.00' },
        ]
      } else if (queryText.toLowerCase().includes('deadline') || queryText.toLowerCase().includes('48')) {
        sql = `SELECT dispute_id, reason, disputed_amount, seller_response_due_date 
FROM disputes 
WHERE seller_response_due_date <= NOW() + INTERVAL '48 HOURS' 
ORDER BY seller_response_due_date ASC;`
        aiContent =
          'There is 1 high-urgency dispute expiring in under 24 hours: PP-D-12849 ($450.00 USD, Unauthorized Transaction). AI evidence draft is 94% complete with FedEx signature confirmation.'
        records = [
          { dispute_id: 'PP-D-12849', amount: '$450.00', due: 'In 18 hours', status: 'Ready for Review' },
        ]
      } else {
        sql = `SELECT t.transaction_id, t.gross_amount, t.net_amount, t.transaction_status 
FROM transactions t 
ORDER BY t.transaction_initiation_date DESC LIMIT 5;`
        aiContent = `Here is the current analysis based on your ledger database query.`
        records = [
          { txn: '9XY82190KV829102X', gross: '$450.00', status: 'Completed' },
          { txn: '4PL10294MM918274L', gross: '$125.00', status: 'Completed' },
        ]
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: aiContent,
        sql,
        records,
      }

      setMessages((prev) => [...prev, aiMsg])
      setLoading(false)
    }, 900)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleAsk(input)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)] shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
              Ask Lucentra AI
            </h1>
            <SandboxBadge />
            <DemoBadge />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Grounded intelligence: questions are translated to deterministic SQL queries against your PayPal ledger.
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 text-xs leading-relaxed ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[rgba(255,138,51,0.12)] border border-[rgba(255,138,51,0.2)] flex items-center justify-center shrink-0 text-[var(--brand-orange)]">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-4 rounded-2xl max-w-xl space-y-3 ${
                m.sender === 'user'
                  ? 'bg-[var(--brand-orange)] text-white font-medium ml-auto'
                  : 'bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)]'
              }`}
            >
              <p>{m.content}</p>

              {m.sql && (
                <div className="mt-2 p-3 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--brand-orange)] overflow-x-auto space-y-1">
                  <div className="flex items-center gap-1 text-[var(--text-muted)] text-[10px]">
                    <Database className="w-3 h-3" />
                    <span>Deterministic Query Executed:</span>
                  </div>
                  <code>{m.sql}</code>
                </div>
              )}

              {m.records && m.records.length > 0 && (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse font-mono bg-[var(--surface-sunken)] rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                        {Object.keys(m.records[0]).map((k) => (
                          <th key={k} className="py-1.5 px-3 text-left">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {m.records.map((r, i) => (
                        <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
                          {Object.values(r).map((v: any, j) => (
                            <td key={j} className="py-1.5 px-3">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-[var(--text-secondary)]">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[rgba(255,138,51,0.1)] flex items-center justify-center text-[var(--brand-orange)]">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>Analyzing query, compiling SQL, and scanning ledger...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="shrink-0 flex items-center gap-2 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your PayPal transactions, disputes, or fees..."
          className="input flex-1 text-xs py-3"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn btn-primary px-4 py-3 flex items-center gap-1.5 text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  )
}
