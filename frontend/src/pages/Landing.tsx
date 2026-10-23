/**
 * Landing page — follows the template layout from Section 6:
 * 1. Sticky nav with wordmark + pill "Get started →" button
 * 2. Two-column hero: headline | mascot video + sparks
 * 3. Pill "Ask Lucentra" input
 * 4. Three feature cards
 * 5. "How it works" 4-step strip
 * 6. FAQ accordion
 * 7. Final CTA + footer with sandbox disclaimer
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import MascotVideo, { MascotPlaceholder } from '../components/MascotVideo'

// ── Spark decoration around mascot ──────────────────────────
function Sparks() {
  const sparks = [
    { top: '8%', left: '72%', rotate: '30deg', height: '28px' },
    { top: '20%', left: '88%', rotate: '-15deg', height: '20px' },
    { top: '55%', left: '90%', rotate: '60deg', height: '16px' },
    { top: '75%', left: '80%', rotate: '-40deg', height: '24px' },
    { top: '85%', left: '60%', rotate: '20deg', height: '18px' },
    { top: '10%', left: '58%', rotate: '-25deg', height: '22px' },
  ]
  return (
    <>
      {sparks.map((s, i) => (
        <span
          key={i}
          className="spark"
          style={{
            top: s.top,
            left: s.left,
            height: s.height,
            transform: `rotate(${s.rotate})`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </>
  )
}

// ── Feature cards ─────────────────────────────────────────────
const FEATURES = [
  {
    icon: Shield,
    iconBg: '#FF8A33',
    title: 'Win more disputes',
    mono: '// AI evidence builder',
    desc: 'AI analyses every dispute, builds structured evidence, flags what\'s missing, and drafts a response—before you submit.',
  },
  {
    icon: Zap,
    iconBg: '#24493A',
    title: 'Reconcile in minutes',
    mono: '// Automated matching',
    desc: 'Match PayPal transactions to your orders deterministically. Every exception explained in plain language.',
  },
  {
    icon: BarChart3,
    iconBg: '#7A1F4B',
    title: 'Trust every action',
    mono: '// Tamper-evident audit trail',
    desc: 'SHA-256 hash chain on every event. Immutable at the DB level. Verifiable with one click.',
  },
] as const

// ── How it works steps ──────────────────────────────────────
const HOW_STEPS = [
  { n: '01', title: 'Connect PayPal', desc: 'Authorise Lucentra to read your sandbox transactions and disputes.' },
  { n: '02', title: 'Auto-reconcile', desc: 'The engine matches every transaction to your orders with explainable rules.' },
  { n: '03', title: 'Build evidence', desc: 'AI drafts a dispute response, flags missing evidence, and validates every claim.' },
  { n: '04', title: 'Approve & submit', desc: 'You review, approve, and submit. Lucentra logs every action to the audit trail.' },
]

// ── FAQ ───────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'Does Lucentra guarantee I\'ll win disputes?',
    a: 'No. Lucentra helps you build stronger, more complete evidence—but outcomes depend on PayPal\'s review process. We never promise a win.',
  },
  {
    q: 'Is this safe to use with real PayPal accounts?',
    a: 'The current demo runs against PayPal Sandbox only. No real money is involved. You will see a "Sandbox" badge in every view.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Transaction and dispute data is stored in a PostgreSQL database that you control. No data is shared with third parties.',
  },
  {
    q: 'Can the AI automatically submit evidence on my behalf?',
    a: 'Never. AI drafts are read-only suggestions. Submission requires explicit human approval through a separate, guarded endpoint.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [askValue, setAskValue] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleAsk = () => {
    if (askValue.trim()) {
      navigate(`/app/ask?q=${encodeURIComponent(askValue.trim())}`)
    } else {
      navigate('/app')
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ── Sticky nav ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(248,238,230,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
      >
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Wordmark */}
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--brand)', letterSpacing: '-0.04em', textDecoration: 'none' }}>
            Lucentra
          </a>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'About', 'Docs'].map((l) => (
              <a key={l} href="#" style={{ color: 'var(--ink-muted)', fontWeight: 500, textDecoration: 'none', fontSize: '0.9375rem' }}
                className="hover:text-luc-ink transition-colors">{l}</a>
            ))}
          </div>

          {/* CTA */}
          <button className="btn-primary" onClick={() => navigate('/app')}>
            Get started <ArrowRight size={15} />
          </button>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                color: 'var(--ink)',
                marginBottom: '0.25em',
              }}
            >
              Protect revenue.<br />
              <span style={{ color: 'var(--brand-strong)' }}>See clearly.</span>
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                color: 'var(--ink-muted)',
                marginTop: '1.25rem',
                marginBottom: '2rem',
                lineHeight: 1.7,
              }}
            >
              // Your AI co-pilot for PayPal disputes and reconciliation,<br />
              // ready when you are.
            </p>

            {/* Pill ask input */}
            <div className="pill-input" style={{ maxWidth: '460px' }}>
              <Sparkles size={18} style={{ color: 'var(--brand)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Ask Lucentra anything…"
                value={askValue}
                onChange={(e) => setAskValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                id="hero-ask-input"
                aria-label="Ask Lucentra a question about your PayPal data"
              />
              <button
                onClick={handleAsk}
                aria-label="Submit question"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--brand-strong)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#fff',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Sandbox disclaimer */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-faint)', marginTop: '1rem' }}>
              // Demo runs on PayPal Sandbox · no real money
            </p>
          </motion.div>

          {/* Right: mascot video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="relative flex justify-center"
          >
            <div className="relative" style={{ width: 'min(100%, 420px)' }}>
              <Sparks />
              <MascotVideo className="mascot-float" width="100%" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', maxWidth: '72rem', margin: '0 auto' }} />

      {/* ── Feature cards ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="card p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className="flex items-center justify-center mb-5"
                style={{ width: 48, height: 48, borderRadius: '50%', background: f.iconBg }}
              >
                <f.icon size={22} color="#fff" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--brand)', marginBottom: '0.75rem' }}>
                {f.mono}
              </p>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--ink)', textAlign: 'center', marginBottom: '3rem' }}>
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col gap-3"
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--brand)', lineHeight: 1 }}>
                {s.n}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>
                {s.title}
              </h3>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--ink)', textAlign: 'center', marginBottom: '2.5rem' }}>
          Frequently asked
        </h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="card overflow-hidden"
              style={{ borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center justify-between px-6 py-4">
                <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.9375rem' }}>{item.q}</span>
                <span style={{ color: 'var(--brand)', fontWeight: 700, fontSize: '1.25rem', transition: 'transform 0.2s' }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </div>
              {openFaq === i && (
                <div className="px-6 pb-4" style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐻</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--ink)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
          Ready to protect your revenue?
        </h2>
        <p style={{ color: 'var(--ink-muted)', fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: '480px', lineHeight: 1.6 }}>
          Connect your PayPal Sandbox account and see Lucentra work in under 5 minutes.
        </p>
        <button className="btn-primary" onClick={() => navigate('/app')}>
          Launch demo <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }} className="px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--brand)', fontSize: '1.1rem' }}>
            Lucentra
          </span>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-faint)', textAlign: 'center' }}>
            // Demo runs on PayPal Sandbox · No real money is processed · Built for the PayPal AI Hackathon 2026
          </p>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.8125rem' }}>
            MIT License
          </p>
        </div>
      </footer>
    </div>
  )
}
