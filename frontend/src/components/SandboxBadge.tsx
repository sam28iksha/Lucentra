/** SandboxBadge — persistent indicator that we're running against PayPal Sandbox. */
export default function SandboxBadge() {
  return (
    <span className="badge-sandbox" title="Running against PayPal Sandbox — no real money">
      <span aria-hidden="true">🏖️</span>
      Sandbox
    </span>
  )
}
