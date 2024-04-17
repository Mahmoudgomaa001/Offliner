import { localVideoDetails } from '@/lib/FileSystemManager'
import { formatNumber, formatSeconds } from '@/lib/utils'
import { Link } from 'react-router-dom'

type Props = {
  videoInfo: localVideoDetails
}
export default function VideoCard({ videoInfo }: Props) {
  return (
    <div className="space-y-2">
      <Link className="font-medium" to={`/videos/${videoInfo.videoId}`}>
        <img
          alt="Video thumbnail"
          className="aspect-video overflow-hidden rounded-lg object-cover w-full"
          height={225}
          src={bestThumbnail(videoInfo.thumbnails).url}
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
    </div>
  )
}

function bestThumbnail(thumbnails) {
  return thumbnails.sort((a, b) => a.width > b.width).at(-1)
}
