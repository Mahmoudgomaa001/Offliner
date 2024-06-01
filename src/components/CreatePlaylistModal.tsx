import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { getAllVideos } from '@/lib/FileSystemManager'
import { Checkbox } from './ui/checkbox'
import { ScrollArea } from './ui/scroll-area'
import { Playlist, createPlaylist, updatePlaylist } from '@/lib/playlist'
import { toast } from './ui/use-toast'
import { DialogClose } from '@radix-ui/react-dialog'

type Props = {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
  playlist?: Playlist
}

type Video = {
  title: string
  videoId: string
}

export default function CreatePlaylistModal({
  playlist,
  children,
  onOpenChange,
}: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(playlist?.name || '')
  const [selectedIds, setSelectedIds] = useState(
    playlist?.videos?.map((v) => v.videoId) || []
  )

  async function saveChanges(e: SyntheticEvent) {
    e.preventDefault()

    if (selectedIds.length === 0) {
      toast({ title: 'No videos selected', duration: 1500 })

      return
    }

    try {
      if (playlist) {
        await updatePlaylist(playlist.id, name, selectedIds)
      } else {
        await createPlaylist(name, selectedIds)
      }

      closeBtnRef.current?.click()
      toast({ title: 'Playlist created!', duration: 900 })
      resetForm()
    } catch (error) {
      toast({ title: error.message || error.toString(), duration: 1500 })
    }
  }

  function handleCheckedChange(videoId: string) {
    return (checked: boolean) => {
      if (checked) setSelectedIds([...selectedIds, videoId])
      else {
        setSelectedIds(selectedIds.toSpliced(selectedIds.indexOf(videoId), 1))
      }
    }
  }

  useEffect(() => {
    getAllVideos().then((videos) => {
      setVideos(videos.map(({ title, videoId }) => ({ title, videoId })))

      setLoading(false)
    })
  }, [])

  function resetForm() {
    setName(playlist?.name || '')
    setSelectedIds(playlist?.videos?.map((v) => v.videoId) || [])
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[calc(100%-20px)] md:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>New Playlists</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <form id="playlists-form" className="py-4" onSubmit={saveChanges}>
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Name
              </Label>
              <Input
                id="name"
                autoComplete="off"
                required
                className="col-span-3"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
              />
            </div>

            <div>
              <p className="mt-3 mb-2">Select videos</p>

              <ScrollArea className="h-72 w-full rounded-md border p-2">
                {videos.map((v) => (
                  <div
                    className="flex items-center gap-2 hover:bg-gray-100 py-2"
                    key={v.videoId}
                  >
                    <Checkbox
                      id={v.videoId}
                      value={v.videoId}
                      checked={selectedIds.includes(v.videoId)}
                      onCheckedChange={handleCheckedChange(v.videoId)}
                    />
                    <label
                      htmlFor={v.videoId}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {v.title}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </form>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="link" ref={closeBtnRef}>
              Close
            </Button>
          </DialogClose>
          <Button form="playlists-form" type="submit">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
