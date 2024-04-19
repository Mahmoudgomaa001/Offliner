import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ devTarget: 'esnext' })],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src', '@'),
    },
  },
})
