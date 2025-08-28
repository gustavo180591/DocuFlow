import { tailwindcss } from '@tailwindcss/vite'
import forms from '@tailwindcss/forms'

export default tailwindcss({
  content: [
    './src/**/*.{html,js,svelte,ts}'
  ],
  plugins: [
    forms
  ],
  darkMode: 'class'
})