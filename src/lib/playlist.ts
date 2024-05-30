import { DBSchema, openDB } from 'idb'
import { getAllVideos, localVideoDetails } from './FileSystemManager'

const storeName = 'playlists'

interface PlaylistDb extends DBSchema {
  [storeName]: {
    key: string
    value: {
      id: string
      name: string
      videoIds: string[]
      createdAt: Date
      lastPlayedId: string | undefined
    }
    indexes: { 'by-name': string; 'by-date': Date }
  }
}

const dbPromise = openDB<PlaylistDb>('PlaylistsDb', 1, {
  upgrade(db) {
    const store = db.createObjectStore(storeName, {
      keyPath: 'id',
    })

    store.createIndex('by-name', 'name', { unique: true })
    store.createIndex('by-date', 'createdAt')
  },
})

export type Playlist = {
  id: string
  name: string
  videos: localVideoDetails[]
  createdAt: Date
}

export async function createPlaylist(name: string, videoIds: string[]) {
  const db = await dbPromise

  const exists = await db.getFromIndex(storeName, 'by-name', name)

  if (exists) throw Error('Name already exist')

  return db.add(storeName, {
    id: crypto.randomUUID(),
    name,
    videoIds,
    createdAt: new Date(),
    lastPlayedId: undefined,
  })
}

export async function getPlaylist(id: string): Promise<Playlist> {
  const db = await dbPromise

  const playlist = await db.get(storeName, id)
  const videos = await getAllVideos(playlist.videoIds)

  return {
    id: playlist.id,
    name: playlist.name,
    videos: videos,
    createdAt: playlist.createdAt,
  }
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await dbPromise

  const [values, videos] = await Promise.all([
    db.getAll(storeName),
    getAllVideos(),
  ])

  return values
    .map((value) => ({
      id: value.id,
      name: value.name,
      createdAt: value.createdAt,
      videos: videos.filter((v) => value.videoIds.includes(v.videoId)),
    }))
    .sort((a, b) =>
      new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? -1 : 1
    )
}

export async function delPlaylist(id: string) {
  return del(id)
}

async function del(key: string) {
  return (await dbPromise).delete(storeName, key)
}
