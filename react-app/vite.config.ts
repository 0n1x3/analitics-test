import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wasm'], // Явно указываем обработку WASM файлов как ассетов
  optimizeDeps: {
    exclude: ['sql.js']
  },
  server: {
    headers: {
      // Эти заголовки важны для правильной работы WebAssembly
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
})
