import path from 'path'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import manifest from './manifest.json' assert { type: 'json' }

const __dirname = new URL('.', import.meta.url).pathname
const r = (p: string) => path.resolve(__dirname, p)

export default defineConfig({
  resolve: {
    alias: {
      '@': r('./src')
    }
  },
  plugins: [react(), crx({ manifest }), svgr()]
})
