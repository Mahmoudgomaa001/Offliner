import { useState } from 'react'
import { MoreVideoDetails } from 'ytdl-core'
import { Download, Loader } from 'lucide-react'

import { createWriteStream } from '@/lib/FileSystemManager'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { formatSeconds } from '@/lib/utils'
import { set } from '@/lib/videoStore'

type Props = {
  videoDetails: MoreVideoDetails
}
export default function VideoDetailsCard({ videoDetails }: Props) {
  const { toast } = useToast()
  const [fetching, setFetching] = useState(false)
  const { thumbnails, title, video_url, lengthSeconds } = videoDetails

  async function downloadVideoStream() {
    const backendUrl = import.meta.env.VITE_API_BASE

    const fileWriteStream = await createWriteStream(videoDetails.videoId)

    setFetching(true)
    const response = await fetch(
      `${backendUrl}/video/download?url=${video_url}`
    )

    await response.body
      .pipeTo(fileWriteStream)
      .catch(console.error)
      .finally(() => {
        setFetching(false)
        set(videoDetails.videoId, videoDetails)
        toast({
          title: `"${title}" Has been downloaded`,
          description: 'You can watch it now',
        })
      })
  }

  return (
    <div className="flex gap-4">
      <img
        src={thumbnails[0].url}
        alt={title}
        className="rounded-lg object-cover"
        height={90}
        width={160}
      />
      <div>
        <p className="text-lg font-semibold line-clamp-2">{title}</p>
        <p>Duration: {formatSeconds(+lengthSeconds)}</p>
      </div>
      <Button className="flex gap-2" onClick={downloadVideoStream}>
        {fetching ? (
          <Loader size={20} className="animate-spin" />
        ) : (
          <Download />
        )}
        Download
      </Button>
    </div>
  )
}
