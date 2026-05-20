import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Apenas arquivos dentro da biblioteca clínica (sem dependências de framework)
    include: ['src/lib/clinical/__tests__/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
