import react from '@vitejs/plugin-react'
import { defineConfig } from 'wxt'

export default defineConfig({
  srcDir: 'src',
  entrypointsDir: 'entries',
  outDir: 'output',
  manifest: {
    name: 'wordwise',
    permissions: ['identity', 'storage', 'identity.email'],
    action: { default_popup: '' },
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArKwXmyvny73aFqvO/E7Jfz3utoUcNpOntBLY20LTnw32D+76xn1CSMygi+BXYocad82nFhU8vZ3WiXO6mjGN6tbyaTob6M0ffWBXNF+8SAehsCJEzFOzlYPggnmOVd/yN/E9uHHeiNug1GgdIeQj7YQ29BUu35dQcGde/XtRHs/SKWm2iAWT9MGM36vxJn8kBVY55xG5Skj9zg+vvo/NQMUwr4WQ9KdShlRg6QDHMrPnLRqTQOAuOjpZmVOmFckZvbBhkcZfNEAfWW6EEqkcj/mj3rdpH2/WtAHXdQ6MGEL03g7YGI8IUa4OMezl7/L1k8+ODKVEfx+xTnuyGSVs7QIDAQAB'
  },
  runner: {
    disabled: true
  },

  vite: () => ({
    plugins: [react()]
  })
})
