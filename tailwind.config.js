/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: '#cef243', // The main neon green/yellow
          glow: '#e0f470',
        },
        dark: {
          background: '#000000',
          surface: '#111111',
          card: '#1A1A1A',
        },
        status: {
          error: '#ef4444',
          success: '#cef243',
        }
      },
      fontFamily: {
        sans: ['Inter-Regular'],
        bold: ['Inter-Bold'],
        mono: ['SpaceMono-Regular'], // We will likely use SpaceMono from Expo templates
      },
    },
  },
  plugins: [],
};
