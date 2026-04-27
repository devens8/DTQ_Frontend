module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vercel-style B&W palette
        panel: '#0a0a0a',
        border: '#1a1a1a',
        'border-light': '#2a2a2a',
        muted: '#888888',
        subtle: '#555555',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
      },
      animation: {
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
};
