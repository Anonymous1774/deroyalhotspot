/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe5ff',
          600: '#2563eb', // Royal Blue Primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          500: '#6b7280',
          700: '#374151',
          900: '#111827'
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        '4px': '4px',
        '8px': '8px',
        '16px': '16px',
        '24px': '24px',
        '32px': '32px',
        '40px': '40px',
        '48px': '48px',
        '64px': '64px'
      },
      borderRadius: {
        'small': '6px',
        'medium': '10px',
        'large': '16px',
        'xlarge': '24px',
        'button': '10px',
        'card': '16px',
        'modal': '20px'
      },
      boxShadow: {
        'small': '0 1px 3px rgba(0,0,0,0.1)',
        'medium': '0 4px 6px rgba(0,0,0,0.1)',
        'large': '0 10px 15px rgba(0,0,0,0.1)',
        'xlarge': '0 20px 25px rgba(0,0,0,0.1)'
      }
    }
  },
  plugins: []
}
