import { formatSeconds } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Video, VideoInfoResponse } from '@/lib/api'

type Props = {
  videoInfo: Video | VideoInfoResponse
}

export default function SmallVideoCard({ videoInfo }: Props) {
  const { thumbnail, title, lengthSeconds, videoId } = videoInfo

  return (
    <div className="flex gap-4">
      <Link to={`/watch?v=${videoId}`}>
        <img
          className="h-12 w-16 rounded-sm ring-1 ring-offset-1 ring-gray-200"
          src={thumbnail}
          alt={title}
        />
      </Link>

      <div className="flex flex-col justify-between">
        <Link to={`/watch?v=${videoId}`}>
          <span className="text-primary line-clamp-2">{title}</span>
        </Link>
        <span className="text-muted-foreground">
          {formatSeconds(+lengthSeconds)}
        </span>
      </div>
    </div>
  )
}
