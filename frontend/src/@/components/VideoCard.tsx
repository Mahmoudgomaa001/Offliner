import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { localVideoDetails, removeVideo } from '@/lib/FileSystemManager'
import { formatNumber, formatSeconds } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Props = {
  videoInfo: localVideoDetails
  onDelete?: (videoId: string) => void
}
export default function VideoCard({ videoInfo, onDelete }: Props) {
  return (
    <div className="space-y-2 relative group">
      <Link className="font-medium" to={`/videos/${videoInfo.videoId}`}>
        <img
          alt="Video thumbnail"
          className="aspect-video overflow-hidden rounded-lg object-cover w-full"
          height={225}
          src={bestThumbnailUrl(videoInfo.thumbnails)}
          width={400}
        />
        <span className="sr-only">Watch video</span>
      </Link>
      <h3 className="text-base font-semibold leading-none">
        <Link className="hover:underline" to="#">
          {videoInfo.title}
        </Link>
      </h3>
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          {formatSeconds(+videoInfo.lengthSeconds)}
        </p>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          {formatNumber(+videoInfo.viewCount)} views
        </p>
      </div>
      <Button
        onClick={async () => {
          await removeVideo(videoInfo.videoId)
          onDelete?.(videoInfo.videoId)
        }}
        size="icon"
        variant="secondary"
        className="absolute !mt-0 top-1 right-1 hidden group-hover:flex"
      >
        <X size={20} />
      </Button>
    </div>
  )
}

function bestThumbnailUrl(thumbnails) {
  const best = thumbnails?.sort((a, b) => a.width > b.width).at(-1)

  return best ? best.url : null
}
