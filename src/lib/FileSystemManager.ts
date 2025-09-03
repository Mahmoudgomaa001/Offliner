import { captureException } from '@sentry/react'
import { del, get } from '@/lib/videoStore'
import { Video } from './api'
import { removeMediaCaches } from './video'

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

type AllVideosProps = {
  videoIds?: string[]
  count?: number
  type?: Video['type']
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

  const videos: Video[] = []

  for await (const [name, handle] of youtubeFolder.entries()) {
    if (videoIds === undefined || (videoIds && videoIds.includes(name))) {
      const info: Video = await get(name)
      // @ts-expect-error
      const file = await handle.getFile()

      if (!info) continue
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
  const video = await getVideo(videoId)

  try {
    video && (await removeMediaCaches(video))
    await youtubeFolder.removeEntry(videoId)
    await del(videoId)
  } catch (error) {
    captureException(error)
    console.log(error)
  }
}
