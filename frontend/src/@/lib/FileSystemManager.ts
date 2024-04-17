import { MoreVideoDetails } from 'ytdl-core'
import { get } from '@/lib/videoStore'

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

/**
const video = document.querySelector('video')
video.setAttribute('controls', true)
video.setAttribute('autoplay', true)

const files = await getAllFiles()

const file = await file[0].fileHandle.getFile()
video.src = URL.createObjectURL(file)
URL.revokeObjectURL(file)

 */
