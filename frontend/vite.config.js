import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url' // 🌟 Importa a ferramenta de conversão segura

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // 🌟 fileURLToPath limpa os %20 e os acentos estranhos do caminho físico
      '@': fileURLToPath(new URL('./src', import.meta.url)), 
    },
    // Força o Vite a usar apenas uma única cópia do React (evita o erro do useContext)
    dedupe: ['react', 'react-dom'], 
  },
})