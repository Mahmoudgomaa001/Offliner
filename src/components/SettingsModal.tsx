import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Options, getAllOptions, setOption } from '@/lib/options'
import { toast } from './ui/use-toast'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

type Props = {
  children: React.ReactNode
}

export default function SettingsModal({ children }: Props) {
  const [loading, setLoading] = useState(true)
  const [useBgFetch, setUseBgFetch] = useState(false)

  useEffect(() => {
    getAllOptions()
      .then((options: Options) => {
        setUseBgFetch(options.useBgFetch)
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveChanges() {
    await setOption('useBgFetch', useBgFetch)
    toast({ title: 'Settings Updated!', duration: 900 })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>change web app settings & flags</DialogDescription>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="bg-fetch"
                onCheckedChange={setUseBgFetch}
                checked={useBgFetch}
              />
              <Label htmlFor="bg-fetch">Background fetch</Label>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="submit" onClick={saveChanges}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
