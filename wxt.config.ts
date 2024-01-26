import react from '@vitejs/plugin-react'
import { defineConfig } from 'wxt'

export default defineConfig({
  srcDir: 'src',
  entrypointsDir: 'entries',
  outDir: 'output',
  manifest: {
    permissions: ['identity', 'storage', 'identity.email'],
    action: { default_popup: '' }
  },
  vite: () => ({
    plugins: [react()]
  })
})
