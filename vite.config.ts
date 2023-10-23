import { defineConfig } from 'vite'
import uno from 'unocss/vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert {type: 'json'}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),crx({manifest}),uno()],
})
