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
          red: {
            DEFAULT: '#E51C23',
            hover: '#CC161C',
            dark: '#B91F2A',
            light: '#FDE8E9',
            subtle: '#FFF5F5',
          },
          orange: {
            DEFAULT: '#F47721',
            hover: '#DF6614',
            light: '#FEF3EB',
          },
          graphite: {
            950: '#111214',
            900: '#171719',
            800: '#202124',
            700: '#323438',
            600: '#4A4D53',
            500: '#646871',
            400: '#8C909A',
            300: '#B8BBC2',
            200: '#DFE1E5',
            100: '#EEF0F2',
            50: '#F7F6F4',
          },
          surface: '#FFFFFF',
          canvas: '#F7F6F4',
          border: '#E2E4E8',
          borderDark: '#2C2E33',
        },
        readiness: {
          critical: '#E51C23',
          warning: '#F59E0B',
          optimal: '#10B981',
          neutral: '#6B7280',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
