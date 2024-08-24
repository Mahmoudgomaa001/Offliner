import { VideoInfoResponse } from './api'

export function getVideoSize(
  selectedFormat: VideoInfoResponse['selectedFormat']
) {
  let size: number, accurate: boolean

  if ('format' in selectedFormat) {
    size = +selectedFormat.format.contentLength
    accurate = true
  } else {
    size =
      +selectedFormat.audioFormat.contentLength +
      +selectedFormat.videoFormat.contentLength

    accurate = selectedFormat.videoFormat.container === 'webm'
  }

  // the size is inaccurate for high res mp4
  return {
    size,
    accurate,
  }
}

type CacheableMedia = {
  thumbnail: VideoInfoResponse['thumbnail']
  author: {
    thumbnail: VideoInfoResponse['author']['thumbnail']
  }
}

const dynamicCacheName = 'dynamic-cache'

export async function removeMediaCaches(video: CacheableMedia) {
  const cache = await caches.open(dynamicCacheName)

  const authorImg = video.author.thumbnail
  const mediaImg = video.thumbnail

  await Promise.allSettled([
    cache.delete(authorImg),
    cache.delete(mediaImg),
  ]).catch(console.error)
}

export async function cacheMediaImages(video: CacheableMedia) {
  const cache = await caches.open(dynamicCacheName)

  const authorImgUrl = video.author.thumbnail
  const mediaImgUrl = video.thumbnail

  const cachedFiles = [authorImgUrl, mediaImgUrl].map(async (url) => {
    const req = new Request(url, { mode: 'no-cors' })
    const response = await fetch(req)

    return cache.put(req, response)
  })

  await Promise.allSettled(cachedFiles)
}
