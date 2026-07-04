/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages のプロジェクトサイトは /design-system/ 配下に出るため、
// 本番ビルドのみ base を付ける。ローカル dev / preview は / のまま。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/design-system/' : '/',
  // PORT があればそれを使う（プレビュー環境が割り当てるポート）。既定は他プロジェクトと衝突しにくい値。
  server: { port: Number(process.env.PORT) || 5273, strictPort: false },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
}))
