import CreatePlaylistModal from '@/components/CreatePlaylistModal'
import useAsync from '@/components/hooks/useAsync'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from '@/components/ui/use-toast'
import { delPlaylist, getAllPlaylists } from '@/lib/playlist'
import { formatSeconds } from '@/lib/utils'
import { ChevronsUpDown, Edit, Trash } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import * as Sentry from '@sentry/react'

export default function Playlists() {
  const { loading, value: playlists, refresh } = useAsync(getAllPlaylists)

  async function removePlaylist(name: string) {
    try {
      await delPlaylist(name)
      refresh()
      toast({ title: 'Playlist removed' })
    } catch (error) {
      Sentry.captureException(error)
      toast({ title: 'An error occurred!' })
    }
  }

  return (
    <main className="max-w-[700px] mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1>Playlists</h1>
        <CreatePlaylistModal onOpenChange={(_) => refresh()}>
          <Button variant="outline">Create</Button>
        </CreatePlaylistModal>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div>
          {playlists.map((p) => (
            <Collapsible key={p.id} className="space-y-2">
              <div className="flex items-center border mb-2 rounded p-2">
                <Link to={`/playlists/${p.id}`} className="flex-grow">
                  {p.name}: ({p.videos.length})
                </Link>

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>

                <CreatePlaylistModal
                  playlist={p}
                  onOpenChange={(open) => !open && refresh()}
                >
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </CreatePlaylistModal>

                <Button
                  onClick={() => removePlaylist(p.id)}
                  variant="ghost"
                  className="hover:bg-red-500 hover:text-white"
                  size="icon"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent className="space-y-2 pb-4 px-4">
                {p.videos.map((v, idx) => (
                  <Fragment key={v.videoId}>
                    <div className="flex gap-2">
                      <img
                        src={v.thumbnails.at(-1).url}
                        alt={p.name}
                        className="h-12 w-12 rounded aspect-video object-cover"
                      />
                      <div>
                        <p>{v.title}</p>
                        <p>{formatSeconds(+v.lengthSeconds)}</p>
                      </div>
                    </div>
                    {idx < p.videos.length - 1 && <hr />}
                  </Fragment>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </main>
  )
}
