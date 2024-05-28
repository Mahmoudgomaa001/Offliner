import CreatePlaylistModal from '@/components/CreatePlaylistModal'
import useAsync from '@/components/hooks/useAsync'
import { Button } from '@/components/ui/button'
import { getAllPlaylists, playlistUrl } from '@/lib/playlist'
import { Link } from 'react-router-dom'

export default function Playlists() {
  const { loading, value: playlists } = useAsync(() => getAllPlaylists())

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
