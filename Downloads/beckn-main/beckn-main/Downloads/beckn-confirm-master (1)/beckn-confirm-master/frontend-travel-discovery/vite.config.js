import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 3000,
    proxy: {
      '/beckn': {
        target: process.env.VITE_BAP_URL || 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: Number(process.env.PORT) || 3000,
  }
})
