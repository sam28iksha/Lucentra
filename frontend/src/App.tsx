import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Reconciliation from './pages/Reconciliation'
import Disputes from './pages/Disputes'
import Evidence from './pages/Evidence'
import Deadlines from './pages/Deadlines'
import Audit from './pages/Audit'
import AskLucentra from './pages/AskLucentra'
import Settings from './pages/Settings'
import Sandbox from './pages/Sandbox'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public landing ─────────────────────────────────── */}
        <Route path="/" element={<Landing />} />

        {/* ── Authenticated app shell ─────────────────────────── */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="disputes" element={<Disputes />} />
          <Route path="disputes/:disputeId/evidence" element={<Evidence />} />
          <Route path="deadlines" element={<Deadlines />} />
          <Route path="audit" element={<Audit />} />
          <Route path="ask" element={<AskLucentra />} />
          <Route path="settings" element={<Settings />} />
          {import.meta.env.VITE_SANDBOX_MODE === 'true' && (
            <Route path="sandbox" element={<Sandbox />} />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
