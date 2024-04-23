import { defineConfig } from 'vite'
import {
  PluginContext,
  NormalizedOutputOptions,
  OutputBundle,
  Plugin,
} from 'rollup'
import path from 'path'
import fs from 'fs'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react({ devTarget: 'esnext' }), addAssetsToSw()],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
})

function addAssetsToSw(): Plugin {
  return {
    name: 'add-assets-to-sw-for-caching',

    writeBundle(
      this: PluginContext,
      options: NormalizedOutputOptions,
      bundle: OutputBundle
    ) {
      const swPath = path.join(options.dir!, 'sw.js')
      const assetFilesNames = Object.keys(bundle)
        .filter((key: string) => key.startsWith('assets'))
        .map((asset) => `"/${asset}"`)

      const data = fs.readFileSync(swPath, {
        encoding: 'utf8',
      })

      const nData = data.replace(
        /.__DYNAMIC_ASSETS__./,
        `${assetFilesNames.join(',')}`
      )

      fs.writeFileSync(swPath, nData)
    },
  }
}
