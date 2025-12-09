/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Age of Empires 3 Color Palette
        'aoe-dark': '#1a1209',
        'aoe-darker': '#0f0a05',
        'aoe-brown': '#2d1f0f',
        'aoe-brown-light': '#3d2a15',
        'aoe-gold': '#c9a227',
        'aoe-gold-light': '#d4af37',
        'aoe-gold-dark': '#a68419',
        'aoe-cream': '#f5e6c8',
        'aoe-cream-dark': '#e8d5b0',
        'aoe-red': '#8b0000',
        'aoe-green': '#006400',
        'aoe-parchment': '#d4c4a8',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'body': ['Georgia', 'serif'],
      },
      backgroundImage: {
        'parchment': "url('/images/bg-parchment.jpg')",
        'wood': "url('/images/bg-wood.jpg')",
      },
      boxShadow: {
        'gold': '0 0 10px rgba(201, 162, 39, 0.5)',
        'gold-lg': '0 0 20px rgba(201, 162, 39, 0.6)',
        'inset-dark': 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
