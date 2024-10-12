import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Options, getAllOptions, setOption } from '@/lib/options'
import { toast } from './ui/use-toast'
import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

type Props = {
  children: React.ReactNode
}

export default function SettingsModal({ children }: Props) {
  const [loading, setLoading] = useState(true)
  const [useBgFetch, setUseBgFetch] = useState(false)
  const [useAutoPlay, setUseAutoPlay] = useState(false)
  const [cookies, setCookies] = useState(null)
  const closeBtnRef = useRef<HTMLButtonElement>()

  useEffect(() => {
    getAllOptions()
      .then((options: Options) => {
        setUseBgFetch(options.useBgFetch)
        setUseAutoPlay(options.autoPlay)
        setCookies(options.cookies)
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveChanges() {
    Promise.all([
      setOption('useBgFetch', useBgFetch),
      setOption('autoPlay', useAutoPlay),
      setOption('cookies', cookies),
    ])
      .then(() => {
        closeBtnRef.current.click()
        toast({ title: 'Settings Updated!', duration: 900 })
      })
      .catch((err) => {
        toast({ title: err.toString(), duration: 900, variant: 'destructive' })
      })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>change web app settings & flags</DialogDescription>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center space-x-2">
              <Label htmlFor="bg-fetch" className="text-md flex-grow">
                Background Fetch
              </Label>
              <Switch
                id="bg-fetch"
                onCheckedChange={setUseBgFetch}
                checked={useBgFetch}
              />
              <p className="text-muted-foreground text-sm !ml-0 w-full">
                Download videos in the background
              </p>
            </div>

            <div className="flex flex-wrap items-center space-x-2">
              <Label htmlFor="bg-fetch" className="text-md flex-grow">
                Auto Play Videos
              </Label>
              <Switch
                id="bg-fetch"
                onCheckedChange={setUseAutoPlay}
                checked={useAutoPlay}
              />
              <p className="text-muted-foreground text-sm !ml-0 w-full">
                Auto play next video after current video has ended
              </p>
            </div>

            <div className="flex flex-wrap items-center space-x-2">
              <Label htmlFor="cookies" className="text-md flex-grow">
                Cookies
              </Label>
              <Textarea
                id="cookies"
                placeholder="Paste your cookies here."
                onChange={(e) => setCookies(e.target.value)}
                value={cookies}
                className="!ml-0"
              />
              <p className="text-muted-foreground text-sm !ml-0 w-full mt-2">
                Use your own Youtube cookie
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose ref={closeBtnRef}></DialogClose>
          <Button type="submit" onClick={saveChanges}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
