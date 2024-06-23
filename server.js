// Sentry integration. this should come first
import './instrument.js'

import express from 'express'
import fs from 'fs'

import VideoRoutes from './backend/routes/video.routes.js'
import path from 'path'

var app = express()
const isProd = process.env.NODE_ENV === 'production'
const __dirname = new URL('.', import.meta.url).pathname

const indexPath = 'index.html'
const root = process.cwd()

let vite

if (!isProd) {
  const viteImport = await import('vite')

  vite = await viteImport.createServer({
    root,
    clearScreen: false,
    logLevel: 'info',
    server: {
      host: true,
      middlewareMode: true,
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    appType: 'custom',
  })

  app.use(vite.middlewares)
}

app.use('/api', VideoRoutes)

if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist')))
} else {
  app.use('*', async (req, res) => {
    res.set({ 'Content-Type': 'text/html' })

    try {
      const url = req.originalUrl
      let template = fs.readFileSync(indexPath, 'utf8')
      template = await vite.transformIndexHtml(url, template)

      res.status(200).end(template)
    } catch (e) {
      console.log(e.stack)
      res.status(500).end(e)
    }
  })
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
