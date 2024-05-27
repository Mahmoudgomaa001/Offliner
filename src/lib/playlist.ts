import { openDB } from 'idb'
import { getAllVideos, localVideoDetails } from './FileSystemManager'

const storeName = 'playlists'
const dbPromise = openDB('Playlists', 1, {
  upgrade(db) {
    db.createObjectStore(storeName)
  },
})

export type Playlist = {
  name: string
  videos: localVideoDetails[]
}

export async function createPlaylist(name: string, videoIds: string[]) {
  return await set(name, videoIds)
}

export async function getAllPlaylists() {
  const db = await dbPromise

  const keysPromise = db.getAllKeys(storeName) as unknown as string[]
  const valuesPromise = db.getAll(storeName)
  const videosPromise = getAllVideos()

  const [keys, values, videos] = await Promise.all([
    keysPromise,
    valuesPromise,
    videosPromise,
  ])

  let playlists: Playlist[] = []

  keys.forEach((k, idx) => {
    playlists.push({
      name: k,
      videos: videos.filter((v) => values[idx].includes(v.videoId)),
    })
  })

  return playlists
}

export function playlistUrl(name: string) {
  return `/playlists/${btoa(name)}`
}

async function set(key: string, val: any) {
  const db = await dbPromise

  return db.put(storeName, val, key)
}

// async function get(key: string) {
//   return (await dbPromise).get(storeName, key)
// }
