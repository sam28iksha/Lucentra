/** DemoBadge — marks seeded/illustrative data so users never mistake it for real data. */
export default function DemoBadge() {
  return (
    <span className="badge-demo" title="This is illustrative demo data, not real PayPal data">
      <span aria-hidden="true">🎭</span>
      Demo data
    </span>
  )
}
