/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages のプロジェクトサイトは /design-system/ 配下に出るため、
// 本番ビルドのみ base を付ける。ローカル dev / preview は / のまま。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/design-system/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
}))
