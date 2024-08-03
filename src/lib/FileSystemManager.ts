import { MoreVideoDetails, videoFormat, videoInfo } from '@distube/ytdl-core'
import { captureException } from '@sentry/react'
import { del, get } from '@/lib/videoStore'

export async function createWriteStream(filename: string) {
  const root = await navigator.storage.getDirectory()
  const youtubeFolder = await root.getDirectoryHandle('youtube', {
    create: true,
  })

  const videoFileHandle = await youtubeFolder.getFileHandle(filename, {
    create: true,
  })

  const writable = await videoFileHandle.createWritable()

  return writable
}

export type localVideoDetails = MoreVideoDetails & {
  file: File
  downloadedAt: Date
}

export type ExtendedVideoInfo = videoInfo & {
  selectedFormat:
    | {
        videoFormat: videoFormat
        audioFormat: videoFormat
      }
    | {
        format: videoFormat
      }
}

export async function getAllVideos({
  videoIds,
  count,
}: { videoIds?: string[]; count?: number } = {}) {
  const root = await navigator.storage.getDirectory()
  const youtubeFolder = await root.getDirectoryHandle('youtube', {
    create: true,
  })

  const videos: localVideoDetails[] = []

  for await (let [name, handle] of youtubeFolder.entries()) {
    if (videoIds === undefined || (videoIds && videoIds.includes(name))) {
      const info = await get(name)
      // @ts-expect-error
      const file = await handle.getFile()

      if (file.size === 0) continue

      videos.push({ ...info, file })
      if (count && videos.length >= count) break
    }
  }

  return videos
}

export async function getVideo(videoId: string) {
  const videos = await getAllVideos()

  return videos.find((v) => v.videoId === videoId)
}

export async function removeVideo(videoId: string) {
  const root = await navigator.storage.getDirectory()
  const youtubeFolder = await root.getDirectoryHandle('youtube')

  try {
    await youtubeFolder.removeEntry(videoId)
    await del(videoId)
  } catch (error) {
    captureException(error)
    console.log(error)
  }
}
