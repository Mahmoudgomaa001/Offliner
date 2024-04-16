export class FileSystemManager {
  async createWriteStream(filename: string) {
    const root = await navigator.storage.getDirectory()

    const videoFileHandle = await root.getFileHandle(filename, {
      create: true,
    })

    const writable = await videoFileHandle.createWritable()

    return writable
  }
}
