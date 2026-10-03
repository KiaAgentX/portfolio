import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // portable: works on GitHub Pages project path, domain root, or file preview
  plugins: [
    react(),
    tailwindcss(),
  ],
})
