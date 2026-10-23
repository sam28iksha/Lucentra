import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Lucentra Warm palette — mirror of tokens.css CSS variables ──────────
      colors: {
        // Backgrounds
        'luc-bg': '#F8EEE6',
        'luc-surface': '#FFF8F2',
        // Brand
        'luc-brand': '#FF8A33',
        'luc-brand-strong': '#FF4D0A',
        // Text
        'luc-ink': '#1B1411',
        'luc-ink-muted': '#6B5A50',
        // Borders
        'luc-border': '#E9D9CB',
        // Accents
        'luc-leaf': '#5BB450',
        'luc-forest': '#24493A',
        'luc-berry': '#7A1F4B',
        // Status
        'luc-matched': '#5BB450',
        'luc-warning': '#F5A524',
        'luc-error': '#D93025',
        'luc-info': '#2F6FED',
        // Dark mode equivalents
        'luc-bg-dark': '#1A1410',
        'luc-surface-dark': '#231C17',
        'luc-border-dark': '#3D2E24',
        'luc-ink-dark': '#F5E8DF',
        'luc-ink-muted-dark': '#A68D7C',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        'card-lg': '24px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(27,20,17,0.06), 0 2px 12px 0 rgba(27,20,17,0.04)',
        'card-hover': '0 4px 24px 0 rgba(27,20,17,0.10)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
