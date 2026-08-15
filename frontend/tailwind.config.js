/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stepped tonal surfaces (near-black to dark blues)
        surface: {
          1: '#05070C',
          2: '#0A0D12',
          3: '#0F131C',
          4: '#161D2B',
          5: '#1E2636',
        },
        // Luminous cyan accent for data/tech domain
        accent: {
          primary: '#38BDF8',
          hover: '#0EA5E9',
          muted: '#6EE7B7',
        },
        // Functional colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        pill: '999px',
        circle: '50%',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'display-lg': 'clamp(3rem, 5vw, 5rem)',
        'display-md': 'clamp(2.5rem, 4vw, 4rem)',
        'display-sm': 'clamp(2rem, 3vw, 3rem)',
        'heading-lg': 'clamp(1.75rem, 2.5vw, 2.5rem)',
        'heading-md': 'clamp(1.5rem, 2vw, 2rem)',
        'heading-sm': 'clamp(1.25rem, 1.5vw, 1.5rem)',
        body: 'clamp(1rem, 1.2vw, 1.125rem)',
      },
      spacing: {
        'section': 'var(--spacing-section)',
        'container': 'var(--spacing-container)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
      },
    },
  },
  plugins: [],
}
