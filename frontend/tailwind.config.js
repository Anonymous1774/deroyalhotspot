/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Ethernet Wire Colours (from the De Royal Hotspot logo) ────────────
        wire: {
          orange: {
            DEFAULT: '#F97316',
            light:   '#FED7AA',
            dark:    '#C2410C',
          },
          green: {
            DEFAULT: '#22C55E',
            light:   '#BBF7D0',
            dark:    '#15803D',
          },
          blue: {
            DEFAULT: '#3B82F6',
            light:   '#BFDBFE',
            dark:    '#1D4ED8',
          },
          brown: {
            DEFAULT: '#B45309',
            light:   '#FDE68A',
            dark:    '#78350F',
          },
        },

        // ── De Royal Navy (primary brand dark) ────────────────────────────────
        navy: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#1D4ED8',
          700: '#1E3A8A',
          800: '#172554',
          900: '#0F1E45',
          950: '#070E24',
        },

        // ── Surface / Light Background ─────────────────────────────────────────
        surface: {
          DEFAULT: '#F8FAFC',
          50:  '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#CBD5E1',
        },

        // ── Existing brand colours (preserved for admin) ───────────────────────
        brand: {
          50:  '#f0f4ff',
          100: '#dbe5ff',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        neutral: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          500: '#6b7280',
          700: '#374151',
          900: '#111827'
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
        info:    '#3b82f6'
      },

      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },

      spacing: {
        '4px':  '4px',
        '8px':  '8px',
        '16px': '16px',
        '24px': '24px',
        '32px': '32px',
        '40px': '40px',
        '48px': '48px',
        '64px': '64px',
        '18':   '4.5rem',
        '22':   '5.5rem',
        '30':   '7.5rem',
      },

      borderRadius: {
        'small':  '6px',
        'medium': '10px',
        'large':  '16px',
        'xlarge': '24px',
        'button': '10px',
        'card':   '16px',
        'modal':  '20px',
      },

      boxShadow: {
        'small':        '0 1px 3px rgba(0,0,0,0.1)',
        'medium':       '0 4px 6px rgba(0,0,0,0.1)',
        'large':        '0 10px 15px rgba(0,0,0,0.1)',
        'xlarge':       '0 20px 25px rgba(0,0,0,0.1)',
        'wire-orange':  '0 4px 24px rgba(249,115,22,0.25)',
        'wire-green':   '0 4px 24px rgba(34,197,94,0.25)',
        'wire-blue':    '0 4px 24px rgba(59,130,246,0.25)',
        'wire-brown':   '0 4px 24px rgba(180,83,9,0.20)',
        'navy':         '0 8px 32px rgba(7,14,36,0.35)',
        'card-hover':   '0 20px 60px rgba(7,14,36,0.12)',
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'wire-flow': {
          '0%':   { 'stroke-dashoffset': '200' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.5s ease-out forwards',
        'fade-up-delay':  'fade-up 0.5s ease-out 0.15s forwards',
        'fade-in':        'fade-in 0.4s ease-out forwards',
        'slide-in-left':  'slide-in-left 0.5s ease-out forwards',
        'scale-in':       'scale-in 0.3s ease-out forwards',
        'pulse-slow':     'pulse-slow 3s ease-in-out infinite',
        'float':          'float 4s ease-in-out infinite',
      },

      backgroundImage: {
        'wire-gradient':     'linear-gradient(135deg, #F97316 0%, #22C55E 33%, #3B82F6 66%, #B45309 100%)',
        'navy-gradient':     'linear-gradient(135deg, #070E24 0%, #0F1E45 100%)',
        'hero-gradient':     'linear-gradient(160deg, #070E24 0%, #0F1E45 60%, #172554 100%)',
        'surface-gradient':  'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'orange-gradient':   'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
      },
    }
  },
  plugins: []
}
