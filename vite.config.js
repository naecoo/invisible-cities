import { defineConfig } from 'vite'

// 相对 base：本地 / 与 GitHub Pages 项目路径均可工作
export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
})
