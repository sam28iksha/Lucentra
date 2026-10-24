/**
 * MascotImage / MascotVideo — renders the brand mascot hero illustration
 * with floating animation and graceful fallbacks.
 */

import { useState } from 'react'

interface MascotProps {
  /** Additional CSS class names */
  className?: string
  /** Width of the image container (CSS value) */
  width?: string
}

export default function MascotVideo({ className = '', width = '100%' }: MascotProps) {
  const [loadError, setLoadError] = useState(false)
  const POSTER = '/media/mascot-poster.png'

  if (loadError) {
    return <MascotPlaceholder className={className} />
  }

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width, aspectRatio: '1 / 1' }}
    >
      <img
        src={POSTER}
        alt="Lucentra mascot — friendly orange bear wearing a green beanie"
        className="w-full h-full object-contain mascot-float"
        style={{
          willChange: 'transform',
        }}
        loading="eager"
        decoding="async"
        onError={() => setLoadError(true)}
      />
    </div>
  )
}

/** Named export alias */
export { MascotVideo as MascotImage }

/**
 * Placeholder shown in the hero area if the mascot image file is missing.
 */
export function MascotPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-card border-2 border-dashed ${className}`}
      style={{
        borderColor: 'var(--brand)',
        background: 'var(--brand-subtle)',
        aspectRatio: '1 / 1',
        padding: '24px',
      }}
    >
      <span style={{ fontSize: '3rem' }}>🐻</span>
      <p
        className="text-center mt-3"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--brand-strong)' }}
      >
        Drop <strong>mascot-poster.png</strong> at<br />
        <code>frontend/public/media/mascot-poster.png</code>
      </p>
    </div>
  )
}
