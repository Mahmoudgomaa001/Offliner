import { formatSeconds } from '@/lib/utils'
import { MoreVideoDetails } from 'ytdl-core'
import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Props = {
  videoDetails: MoreVideoDetails
}
export default function VideoDetailsCard({ videoDetails }: Props) {
  const { thumbnails, title, video_url, lengthSeconds } = videoDetails
  const imgUrl = thumbnails[0].url
  const backendUrl = import.meta.env.VITE_API_BASE

  const params = new URLSearchParams(location.search)
  // this download the whole file on the server before streaming it
  const downloadFirst = params.has('download-first')

  return (
    <div className="flex gap-4">
      <img
        src={imgUrl}
        alt={title}
        className="rounded-lg object-cover"
        height={90}
        width={160}
      />
      <div>
        <p className="text-lg font-semibold line-clamp-2">{title}</p>
        <p>Duration: {formatSeconds(+lengthSeconds)}</p>
      </div>
      <Button asChild className="flex gap-2">
        <a
          href={`${backendUrl}/video/${
            downloadFirst ? 'download-first' : 'download'
          }?url=${video_url}`}
        >
          <Download />
          Download
        </a>
      </Button>
    </div>
  )
}
