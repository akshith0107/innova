import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function verifyExtensionZipPlugin(): Plugin {
  return {
    name: 'verify-extension-zip',
    buildStart() {
      const zipPath = path.resolve('public/downloads/chrome-mv3-prod.zip');
      if (!fs.existsSync(zipPath)) {
        console.warn('\n\x1b[33m%s\x1b[0m', '⚠️  [BUILD WARNING] public/downloads/chrome-mv3-prod.zip is missing! "Add Extension" download feature requires this asset.\n');
      } else {
        const stats = fs.statSync(zipPath);
        console.log(`\n\x1b[32m%s\x1b[0m`, `✅ [BUILD CHECK] public/downloads/chrome-mv3-prod.zip verified (${Math.round(stats.size / 1024)} KB).\n`);
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), verifyExtensionZipPlugin()],
})
