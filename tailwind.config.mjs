/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
        fontFamily: {
        mont: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        },
        colors: {offwhite: '#DFD0B8',

        },        
    },
  },
  plugins: [],
};