import { tailwindcss } from '@tailwindcss/vite';
import forms from '@tailwindcss/forms';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default tailwindcss({
  content: [
    './src/**/*.{html,js,svelte,ts}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Use CSS variables for dynamic theming
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
          muted: 'rgb(var(--brand-muted) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
        background: {
          primary: 'rgb(var(--bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)'
      },
      boxShadow: {
        'soft': 'var(--shadow-soft, 0 2px 10px rgba(0, 0, 0, 0.08))'
      }
    }
  },
  plugins: [
    forms,
    // Add CSS variables to :root
    plugin(function({ addBase }) {
      addBase({
        ':root': {
          // Brand colors (from SystemConfig)
          '--brand-primary': '79 70 229',
          '--brand-secondary': '99 102 241',
          '--brand-muted': '99 102 120',
          
          // Text colors
          '--text-primary': '17 24 39', // gray-900
          '--text-secondary': '75 85 99', // gray-600
          
          // Background colors
          '--bg-primary': '255 255 255', // white
          '--bg-secondary': '249 250 251', // gray-50
          
          // Border radius
          '--border-radius': '0.5rem',
          
          // Shadows
          '--shadow-soft': '0 2px 10px rgba(0, 0, 0, 0.08)',
        },
        // Dark mode overrides
        '.dark': {
          // Text colors
          '--text-primary': '243 244 246', // gray-100
          '--text-secondary': '209 213 219', // gray-300
          
          // Background colors
          '--bg-primary': '17 24 39', // gray-900
          '--bg-secondary': '31 41 55', // gray-800
          
          // Shadows
          '--shadow-soft': '0 2px 10px rgba(0, 0, 0, 0.2)',
        },
      });
    })
  ]
});