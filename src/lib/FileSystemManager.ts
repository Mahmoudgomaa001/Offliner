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
  type: 'audio' | 'video'
  downloadedAt: Date
}

export type ExtendedVideoInfo = videoInfo & {
  selectedFormat:
    | {
        videoFormat: videoFormat
        audioFormat: videoFormat
        highestAudioOnly: videoFormat
      }
    | {
        format: videoFormat
        highestAudioOnly: videoFormat
      }
}

type AllVideosProps = {
  videoIds?: string[]
  count?: number
  type?: localVideoDetails['type']
}
export async function getAllVideos({
  videoIds,
  count,
  type,
}: AllVideosProps = {}) {
  const root = await navigator.storage.getDirectory()
  const youtubeFolder = await root.getDirectoryHandle('youtube', {
    create: true,
  })

  const videos: localVideoDetails[] = []

  for await (let [name, handle] of youtubeFolder.entries()) {
    if (videoIds === undefined || (videoIds && videoIds.includes(name))) {
      const info: localVideoDetails = await get(name)
      // @ts-expect-error
      const file = await handle.getFile()

      if (file.size === 0) continue
      if (type === 'audio' && info.type !== 'audio') continue
      if (type === 'video' && info.type !== 'video' && !!info.type) continue

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
