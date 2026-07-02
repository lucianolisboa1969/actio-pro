/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0f1e',
        surface: '#0f1829',
        card: '#111827',
        border: '#1e2d42',
        primary: '#4ade80',
        'primary-dim': '#22c55e',
        muted: '#6b7280',
        'zone-leve': '#4ade80',
        'zone-moderado': '#f97316',
        'zone-forte': '#ef4444',
        'card-red': '#2d1515',
        'card-green': '#152d1a',
        'card-teal': '#152d2d',
        'card-purple': '#1e152d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
