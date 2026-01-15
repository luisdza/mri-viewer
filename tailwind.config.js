/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme color palette matching the MRI viewer screenshot
        'viewer-bg': '#0f1419',
        'viewer-panel': '#1a2332',
        'viewer-card': '#1e2a3a',
        'viewer-border': '#2d3f52',
        'viewer-accent': '#3b82f6',
        'viewer-accent-hover': '#2563eb',
        'viewer-text': '#e5e7eb',
        'viewer-text-muted': '#9ca3af',
        'viewer-success': '#22c55e',
      },
    },
  },
  plugins: [],
}
