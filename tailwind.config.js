/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}', // tambahan jika kamu pakai folder src/
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Courier New', 'monospace'],
      },
      spacing: {
        // Misalnya kamu aktifkan custom spacing .py-4.5 (1.125rem)
        '4.5': '1.125rem',
        // Custom spacing for logo and spinner sizes
        '25': '6.25rem', // 100px - for w-25, h-25
        '35': '8.75rem', // 140px - for w-35, h-35
      },
      borderWidth: {
        '7': '7px', // for border-t-7
      },
    },
  },
  plugins: [],
}
