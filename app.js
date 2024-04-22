import express from 'express'
import cors from 'cors'

import path from 'path'

import VideoRoutes from './backend/routes/video.routes.js'

var app = express()

const __dirname = new URL('.', import.meta.url).pathname

app.use(cors())
app.use(express.static(path.join(__dirname, './public')))

app.use('/api', VideoRoutes)

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running!')
})
