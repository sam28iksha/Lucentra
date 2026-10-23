/**
 * MascotVideo — renders the brand mascot hero video with multiple fallbacks.
 *
 * Behavior:
 * - Plays webm first (smaller, AV1/VP9), falls back to mp4 (H.264)
 * - Pauses via IntersectionObserver when scrolled off-screen
 * - Pauses under prefers-reduced-motion, shows poster instead
 * - Falls back to poster image on load error
 * - If neither video nor poster is present, shows a visible orange
 *   placeholder with clear instructions (build never fails silently)
 */

import { useEffect, useRef, useState } from 'react'

interface MascotVideoProps {
  /** Additional CSS class names */
  className?: string
  /** Width of the video container (CSS value) */
  width?: string
}

export default function MascotVideo({ className = '', width = '100%' }: MascotVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loadError, setLoadError] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Pause/resume based on visibility (IntersectionObserver)
  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {/* autoplay blocked — poster will show */})
        } else {
          video.pause()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [reducedMotion])

  // Pause video when reduced motion is preferred
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reducedMotion) {
      video.pause()
    }
  }, [reducedMotion])

  const POSTER = '/media/mascot-poster.png'
  const VIDEO_WEBM = '/media/mascot-hero.webm'
  const VIDEO_MP4 = '/media/mascot-hero.mp4'

  // Show poster only (reduced motion or load error after video attempt)
  if (reducedMotion || loadError) {
    return (
      <img
        src={POSTER}
        alt="Lucentra mascot — friendly orange bear with a green beanie"
        className={`mascot-float object-contain w-full ${className}`}
        style={{ width, aspectRatio: '1 / 1' }}
        onError={() => {
          // Poster also failed — show placeholder
        }}
      />
    )
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width, aspectRatio: '1 / 1' }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={POSTER}
        className="w-full h-full object-contain mascot-float"
        style={{ mixBlendMode: 'multiply' }}
        onError={() => setLoadError(true)}
      >
        <source src={VIDEO_WEBM} type="video/webm" />
        <source src={VIDEO_MP4} type="video/mp4" />
        {/* Fallback for browsers that can't play the video */}
        <img
          src={POSTER}
          alt="Lucentra mascot — friendly orange bear with a green beanie"
          className="w-full h-full object-contain"
        />
      </video>

      {/* Placeholder shown when video files are missing (dev helper) */}
      <noscript>
        <img
          src={POSTER}
          alt="Lucentra mascot"
          className="w-full h-full object-contain"
        />
      </noscript>
    </div>
  )
}

/**
 * Placeholder shown in the hero area when the video file is missing.
 * This is intentionally visible — the developer must notice and fix it.
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
        Drop <strong>mascot-hero.mp4</strong> at<br />
        <code>frontend/public/media/mascot-hero.mp4</code><br />
        (see README for specs)
      </p>
    </div>
  )
}
