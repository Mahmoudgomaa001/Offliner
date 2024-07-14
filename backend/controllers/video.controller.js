import fs from 'fs'
import ytdl from 'ytdl-core'

import { downloadHighestQualityVideo, selectFormat } from '../utils/video.js'
import { logger } from '../utils/logger.js'

const TMP_FILE = 'file'

export const videoInfo = async (req, res) => {
  const { url } = req.query

  if (!url) return res.send({ error: 'url query is required' })

  try {
    const info = await ytdl.getInfo(url)
    const selectedFormat = selectFormat(info.formats)

    res.send({ ...info, selectedFormat })
  } catch (error) {
    res.status(500).send({ error: error.toString() })
  }
}

export const videoDownload = async (req, res) => {
  const { url } = req.query

  if (!url) return res.send({ error: 'url query is required' })

  const stream = await downloadHighestQualityVideo(url, res)

  stream
    .on('error', (err) => {
      logger.error(err.toString())

      if (res.writableEnded) return
      req.destroy()
      res.removeHeader('Content-Length')
      res.status(err.statusCode || 500).end()
    })
    .pipe(res)
}

export const videoDownloadFirst = async (req, res) => {
  const { url } = req.query

  const writeStream = fs.createWriteStream(TMP_FILE)
  writeStream.on('error', logger.error)

  const downloadStream = await downloadHighestQualityVideo(url, res)

  downloadStream.pipe(writeStream)

  downloadStream.on('error', (err) => {
    logger.error(err)
    res.end()
  })

  downloadStream.on('end', () => {
    const size = fs.statSync('file').size
    res.header('Content-Length', size)

    const deleteTmpFile = () => fs.unlink(TMP_FILE, logger.error)

    fs.createReadStream(TMP_FILE)
      .on('end', deleteTmpFile)
      .on('error', (err) => {
        logger.error(err)
        deleteTmpFile()
      })
      .pipe(res)
  })
}
