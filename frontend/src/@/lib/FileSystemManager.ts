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

export async function getAllVideos() {
  const root = await navigator.storage.getDirectory()
  const youtubeFolder = await root.getDirectoryHandle('youtube')

  const videos: { title: string; handle: FileSystemFileHandle }[] = []

  // @ts-expect-error
  for await (let [name, handle] of youtubeFolder.entries()) {
    FileSystemDirectoryHandle
    videos.push({ title: name, handle })
  }

  return videos
}

