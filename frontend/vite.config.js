import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy tới PHP built-in server do start.ps1 khởi động ở port 8000.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Ảnh upload cũng nằm trên backend, cần proxy luôn để <img> hiển thị được
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})