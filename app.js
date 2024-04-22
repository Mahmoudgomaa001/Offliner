import express from 'express'
import fs from 'fs'
import cors from 'cors'

import path from 'path'

import VideoRoutes from './backend/routes/video.routes.js'

var app = express()
const isProd = process.env.NODE_ENV === 'production'
const indexPath = './frontend/index.html'
const indexProd = isProd ? fs.readFileSync(indexPath, 'utf-8') : ''
const __dirname = new URL('.', import.meta.url).pathname

// app.use(cors())
// app.use(express.static(path.join(__dirname, './public')))

let vite

if (!isProd) {
  const viteImport = await import('vite')

  vite = await viteImport.createServer({
    root: './frontend',
    clearScreen: false,
    logLevel: 'info',
    server: {
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

app.use('*', async (req, res) => {
  res.set({ 'Content-Type': 'text/html' })

  try {
    if (!isProd) {
      const url = req.originalUrl
      let template = fs.readFileSync(indexPath, 'utf8')
      template = await vite.transformIndexHtml(url, template)

      res.status(200).end(template)
      return
    }

    res.status(200).sendFile(indexProd)
  } catch (e) {
    console.log(e.stack)
    res.status(500).end(e)
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running!')
})
