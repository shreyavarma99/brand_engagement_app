/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hacker-bg': '#0d1117',
        'hacker-surface': '#161b22',
        'hacker-border': '#30363d',
        'hacker-text': '#c9d1d9',
        'hacker-text-dim': '#8b949e',
        'hacker-primary': '#58a6ff',
        'hacker-accent': '#3fb950',
        'hacker-warning': '#d29922',
        'hacker-danger': '#f85149',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
}


