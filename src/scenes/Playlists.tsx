import CreatePlaylistModal from '@/components/CreatePlaylistModal'
import { Button } from '@/components/ui/button'
import { Playlist, getAllPlaylists, playlistUrl } from '@/lib/playlist'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllPlaylists()
      .then(setPlaylists)
      .catch((err) => {
        console.log(err)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-[700px] mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1>Playlists</h1>
        <CreatePlaylistModal>
          <Button variant="outline">Create</Button>
        </CreatePlaylistModal>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div>
          {playlists.map((p) => (
            <div key={p.name}>
              <Link to={playlistUrl(p.name)}>{p.name}</Link>: ({p.videos.length}
              )
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
