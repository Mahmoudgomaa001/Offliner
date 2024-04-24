import fs from 'fs'
import ytdl from 'ytdl-core'

import { downloadHighestQualityVideo } from '../utils/video.js'

const TMP_FILE = 'file'

export const videoInfo = async (req, res) => {
  const { url } = req.query

  if (!url) return res.send({ error: 'url query is required' })

  try {
    const info = await ytdl.getInfo(url)

    res.send(info)
  } catch (error) {
    res.status(500).send({ error: error.toString() })
  }
}

export const videoDownload = async (req, res) => {
  const { url } = req.query

  if (!url) return res.send({ error: 'url query is required' })

  const stream = await downloadHighestQualityVideo(url, res)

  stream.pipe(res)
}

export const videoDownloadFirst = async (req, res) => {
  const { url } = req.query

  const writeStream = fs.createWriteStream(TMP_FILE)
  writeStream.on('error', console.error)

  const downloadStream = await downloadHighestQualityVideo(url, res)

  downloadStream.pipe(writeStream)

  downloadStream.on('error', (err) => {
    console.error(err)
    res.end()
  })

  downloadStream.on('end', () => {
    const size = fs.statSync('file').size
    res.header('Content-Length', size)

    const deleteTmpFile = () => fs.unlink(TMP_FILE, console.log)

    fs.createReadStream(TMP_FILE)
      .on('end', deleteTmpFile)
      .on('error', (err) => {
        console.log(err)
        deleteTmpFile()
      })
      .pipe(res)
  })
}
