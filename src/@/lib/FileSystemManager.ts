import { MoreVideoDetails } from 'ytdl-core'
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

export async function getAllVideos() {
  const root = await navigator.storage.getDirectory()
  const youtubeFolder = await root.getDirectoryHandle('youtube', {
    create: true,
  })

  const videos: localVideoDetails[] = []

  // @ts-expect-error
  for await (let [name, handle] of youtubeFolder.entries()) {
    const info = await get(name)
    videos.push({ ...info, file: await handle.getFile() })
  }

  return videos
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
    console.log(error)
  }
}
