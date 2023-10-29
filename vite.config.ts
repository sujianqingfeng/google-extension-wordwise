import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' }
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), crx({ manifest }), svgr()]
})
