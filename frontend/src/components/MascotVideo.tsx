/**
 * MascotVideo — renders the brand mascot hero video with multiple fallbacks.
 *
 * Behavior:
 * - Direct MP4 playback with explicit DOM-level muting (bypasses browser autoplay blocks)
 * - Auto-plays on mount and resumes via IntersectionObserver when visible
 * - Pauses under prefers-reduced-motion, showing poster instead
 * - Interactive click-to-play / click-to-toggle
 * - Robust error handling without premature fallback swapping
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
  const [hasFatalError, setHasFatalError] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const POSTER = '/media/mascot-poster.png'
  const VIDEO_MP4 = '/media/mascot-hero.mp4'

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Explicitly ensure DOM properties for autoplay compliance
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // CRITICAL: Browsers block autoplay if DOM properties defaultMuted / muted are false
    video.defaultMuted = true
    video.muted = true

    const attemptPlay = () => {
      if (reducedMotion) return
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Autoplay prevented or waiting for interaction:', err)
            setIsPlaying(false)
          })
      }
    }

    // Play when video is ready
    if (video.readyState >= 2) {
      attemptPlay()
    } else {
      video.addEventListener('loadeddata', attemptPlay, { once: true })
      video.addEventListener('canplay', attemptPlay, { once: true })
    }

    // IntersectionObserver to pause when scrolled off-screen and play when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attemptPlay()
        } else {
          video.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
      video.removeEventListener('loadeddata', attemptPlay)
      video.removeEventListener('canplay', attemptPlay)
    }
  }, [reducedMotion])

  // Pause video when reduced motion is preferred
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reducedMotion) {
      video.pause()
      setIsPlaying(false)
    }
  }, [reducedMotion])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  // Show poster only under prefers-reduced-motion or true fatal video error
  if (reducedMotion || hasFatalError) {
    return (
      <img
        src={POSTER}
        alt="Lucentra mascot — friendly orange bear with a green beanie"
        className={`mascot-float object-contain w-full ${className}`}
        style={{ width, aspectRatio: '1 / 1' }}
      />
    )
  }

  return (
    <div
      className={`relative cursor-pointer select-none ${className}`}
      style={{ width, aspectRatio: '1 / 1' }}
      onClick={togglePlayback}
      title="Click to play / pause mascot video"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
        className="w-full h-full object-contain mascot-float"
        style={{ mixBlendMode: 'multiply' }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Video encountered an error:', e)
          const vid = videoRef.current
          if (vid?.error) {
            console.error('Video error code:', vid.error.code, vid.error.message)
            setHasFatalError(true)
          }
        }}
      >
        <source src={VIDEO_MP4} type="video/mp4" />
        <img
          src={POSTER}
          alt="Lucentra mascot — friendly orange bear with a green beanie"
          className="w-full h-full object-contain"
        />
      </video>

      {/* Subtle play hint when paused */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
          style={{ opacity: 0.6 }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}
          >
            <span style={{ fontSize: '1.25rem', marginLeft: '2px', color: 'var(--brand-strong)' }}>▶</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Placeholder shown in the hero area when the video file is missing.
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
        <code>frontend/public/media/mascot-hero.mp4</code>
      </p>
    </div>
  )
}
