/**
 * Money helpers for frontend — all monetary amounts handled as minor units (cents).
 */

const MINOR_UNITS: Record<string, number> = {
  USD: 100,
  EUR: 100,
  GBP: 100,
  CAD: 100,
  AUD: 100,
  INR: 100,
  JPY: 1,
  KRW: 1,
  HUF: 1,
  TWD: 1,
  BHD: 1000,
  KWD: 1000,
  OMR: 1000,
  JOD: 1000,
}

export function formatMoney(amountMinor: number, currency: string = 'USD'): string {
  const code = (currency || 'USD').toUpperCase()
  const divisor = MINOR_UNITS[code] ?? 100
  const value = amountMinor / divisor

  if (divisor === 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function parseToMinor(amountStr: string, currency: string = 'USD'): number {
  const code = (currency || 'USD').toUpperCase()
  const divisor = MINOR_UNITS[code] ?? 100
  const clean = amountStr.replace(/[^0-9.-]/g, '')
  const val = parseFloat(clean)
  if (isNaN(val)) return 0
  return Math.round(val * divisor)
}
