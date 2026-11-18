/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf3f5',
          100: '#f5e3e8',
          200: '#e9c5d0',
          300: '#d69aab',
          400: '#bd6c85',
          500: '#a74464',
          600: '#8d294b',
          700: '#741e3c',
          800: '#5b1932',
          900: '#3d1225',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(15, 23, 42, 0.18)',
        card: '0 2px 12px -4px rgba(15, 23, 42, 0.12)',
        glow: '0 18px 45px -15px rgba(141, 41, 75, 0.48)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
