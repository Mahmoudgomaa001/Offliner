import fs from 'fs'
import path from 'path'
import { captureException } from '@sentry/node'
import ytSearch from 'yt-search'

import {
  downloadHighestQualityVideo,
  downloadHighestQyalityAudio,
  selectFormat,
} from '../utils/video.js'
import { logger } from '../utils/logger.js'
import { pipeline } from 'stream'
import {
  formatVideoDetails,
  formatVideoFormats,
} from '../formatters/videoDetailsFormatter.js'
import { getVideoInfo, setCookie, downloadVideo } from '../utils/ytdl.js'

const TMP_FILE = 'file_' + crypto.randomUUID()

export const videoInfo = async (req, res) => {
  const { url, cookie } = req.query

  if (cookie) setCookie(cookie.trim())

  if (!url) return res.send({ error: 'url query is required' })

  try {
    const info = await getVideoInfo(url)
    const selectedFormat = selectFormat(info.formats)

    res.send({
      ...formatVideoDetails(info.videoDetails),
      selectedFormat: formatVideoFormats(selectedFormat),
    })
  } catch (error) {
    res.status(500).send({ error: error.toString() })
  }
}

export const videoDownload = async (req, res) => {
  const { url, audioOnly, cookie } = req.query

  if (cookie) setCookie(cookie.trim())

  if (!url) return res.send({ error: 'url query is required' })

  let stream
  if (audioOnly) {
    stream = await downloadHighestQyalityAudio(url, res)
  } else {
    stream = await downloadHighestQualityVideo(url, res)
  }

  stream
    .on('error', (err) => {
      logger.error(err.toString())
      captureException(err)

      if (res.writableEnded) return
      req.destroy()
      !res.headersSent && res.removeHeader('Content-Length')
      res.status(err.statusCode || 500).end()
    })
    .pipe(res)
}

export const videoDownloadFirst = async (req, res) => {
  const { url } = req.query

  const downloadStream = await downloadHighestQualityVideo(url, res)

  const deleteTmpFile = () => fs.unlink(TMP_FILE, (err) => err && logger.error)

  const handleError = (err) => {
    logger.error(err)
    captureException(err)
    deleteTmpFile()
    res.status(500).end()
  }

  pipeline(downloadStream, fs.createWriteStream(TMP_FILE), (err) => {
    if (err) {
      return handleError(err)
    }

    const size = fs.statSync(TMP_FILE).size
    res.header('Content-Length', size)
    pipeline(fs.createReadStream(TMP_FILE), res, (err) => {
      if (err) {
        return handleError(err)
      }

      deleteTmpFile()
    })
  })
}

const CACHE_DIR = path.join(process.cwd(), 'cache')

// Create cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

export const videoStream = async (req, res) => {
  const { id: videoId } = req.query
  if (!videoId) {
    return res.status(400).send({ error: 'video id query is required' })
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
  const filePath = path.join(CACHE_DIR, `${videoId}.mp4`)

  try {
    if (fs.existsSync(filePath)) {
      // Video is cached, stream it from the file
      logger.info(`Streaming video ${videoId} from cache.`)
      const stat = fs.statSync(filePath)
      const fileSize = stat.size
      const range = req.headers.range

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunksize = end - start + 1
        const file = fs.createReadStream(filePath, { start, end })
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head)
        file.pipe(res)
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(filePath).pipe(res)
      }
    } else {
      // Video is not cached, download it from YouTube, stream it, and cache it
      logger.info(`Downloading and streaming video ${videoId}.`)

      // Get video info and save metadata
      try {
        const info = await getVideoInfo(videoUrl)
        const details = formatVideoDetails(info.videoDetails)
        const metadataPath = path.join(CACHE_DIR, 'metadata.json')
        let metadata = {}
        if (fs.existsSync(metadataPath)) {
          metadata = JSON.parse(fs.readFileSync(metadataPath))
        }
        metadata[videoId] = details
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
        logger.info(`Saved metadata for video ${videoId}.`)
      } catch (error) {
        logger.error(`Failed to save metadata for ${videoId}: ${error}`)
        // We can still proceed with the download even if metadata fails
      }

      const downloadStream = await downloadHighestQualityVideo(videoUrl, res)
      const fileStream = fs.createWriteStream(filePath)

      downloadStream.on('data', (chunk) => {
        fileStream.write(chunk)
      })

      downloadStream.on('end', () => {
        fileStream.end()
        logger.info(`Successfully cached video ${videoId}.`)
      })

      downloadStream.on('error', (err) => {
        fileStream.close()
        fs.unlink(filePath, () => {}) // Delete partial file
        logger.error(`Error caching video ${videoId}: ${err.message}`)
      })

      pipeline(downloadStream, res, (err) => {
        if (err) {
          logger.error(
            `Error streaming video ${videoId} to response: ${err.message}`
          )
        }
      })
    }
  } catch (error) {
    logger.error(`Error in videoStream for ${videoId}: ${error.toString()}`)
    captureException(error)
    if (!res.headersSent) {
      res.status(500).send({ error: error.toString() })
    }
  }
}

export const search = async (req, res) => {
  const { q: query } = req.query
  if (!query) {
    return res.status(400).send({ error: 'query is required' })
  }

  try {
    // 1. Search local cache
    const metadataPath = path.join(CACHE_DIR, 'metadata.json')
    let cachedVideos = []
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath))
      cachedVideos = Object.values(metadata).filter((video) =>
        video.title.toLowerCase().includes(query.toLowerCase())
      )
    }

    // 2. Search YouTube
    const searchResults = await ytSearch(query)
    const youtubeVideos = searchResults.videos

    // 3. Combine results
    const cachedVideoIds = new Set(cachedVideos.map((v) => v.videoId))
    const filteredYoutubeVideos = youtubeVideos.filter(
      (v) => !cachedVideoIds.has(v.videoId)
    )

    // Format youtube videos to match our metadata structure
    const formattedYoutubeVideos = filteredYoutubeVideos.map((v) => ({
      videoId: v.videoId,
      title: v.title,
      author: { name: v.author.name },
      viewCount: v.views,
      lengthSeconds: v.seconds,
      thumbnail: v.thumbnail,
    }))

    const combinedResults = [...cachedVideos, ...formattedYoutubeVideos]

    res.send(combinedResults)
  } catch (error) {
    logger.error(`Search failed for query "${query}": ${error}`)
    captureException(error)
    res.status(500).send({ error: 'Search failed' })
  }
}
