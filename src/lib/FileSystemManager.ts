import { MoreVideoDetails, videoFormat, videoInfo } from 'ytdl-core'
import * as Sentry from '@sentry/node';
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

export async function getAllVideos(videoIds?: string[]) {
  const root = await navigator.storage.getDirectory()
  const youtubeFolder = await root.getDirectoryHandle('youtube', {
    create: true,
  })

  const videos: localVideoDetails[] = []

  for await (let [name, handle] of youtubeFolder.entries()) {
    if (videoIds === undefined || (videoIds && videoIds.includes(name))) {
      const info = await get(name)
      // @ts-expect-error
      videos.push({ ...info, file: await handle.getFile() })
    }
  }

  return videos.filter((v) => v.file.size > 0)
}

export async function getVideo(videoId: string) {
  const videos = await getAllVideos()

  return videos.find((v) => v.videoId === videoId)
}

export async function removeVideo(videoId: string) {
  const root = await navigator.storage.getDirectory()
  const youtubeFolder = await root.getDirectoryHandle('youtube', {
    create: true,
  })

  try {
    const videoFileHandle = await youtubeFolder.getFileHandle(videoId)

    // @ts-expect-error
    await videoFileHandle.remove()
    await del(videoId)
  } catch (error) {
    Sentry.captureException(error)
    console.log(error)
  }
}
