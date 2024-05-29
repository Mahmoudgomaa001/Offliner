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
import { createPlaylist } from '@/lib/playlist'
import { toast } from './ui/use-toast'
import { DialogClose } from '@radix-ui/react-dialog'

type Props = {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

type Video = {
  title: string
  videoId: string
}

export default function CreatePlaylistModal({ children, onOpenChange }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [selectedVideos, setSelectedVideos] = useState<Record<string, boolean>>(
    {}
  )

  async function saveChanges(e: SyntheticEvent) {
    e.preventDefault()

    const selectedIds = Object.entries(selectedVideos)
      .filter(([_, checked]) => checked)
      .map(([id]) => id)

    try {
      await createPlaylist(name, selectedIds)
      closeBtnRef.current?.click()
      toast({ title: 'Playlist created!', duration: 900 })
      resetForm()
    } catch (error) {
      toast({ title: error, duration: 900 })
    }
  }

  function handleCheckedChange(videoId: string) {
    return (checked: boolean) => {
      setSelectedVideos({ ...selectedVideos, [videoId]: checked })
    }
  }

  useEffect(() => {
    getAllVideos().then((videos) => {
      setVideos(videos.map(({ title, videoId }) => ({ title, videoId })))

      setLoading(false)
    })
  }, [])

  function resetForm() {
    setName('')
    setSelectedVideos({})
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
          <form id="playlists-form" className="py-4">
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
                  <div className="flex items-center gap-2 my-2" key={v.videoId}>
                    <Checkbox
                      id={v.videoId}
                      value={v.videoId}
                      checked={selectedVideos[v.videoId]}
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
          <Button form="playlists-form" type="submit" onClick={saveChanges}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
