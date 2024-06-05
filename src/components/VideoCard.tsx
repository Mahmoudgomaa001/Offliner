import { Eye, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { localVideoDetails, removeVideo } from '@/lib/FileSystemManager'
import { formatNumber, formatSeconds, humanFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Props = {
  videoInfo: localVideoDetails
  onDelete?: (videoId: string) => void
  onClick?: (videoId: string) => void
}
export default function VideoCard({ videoInfo, onDelete, onClick }: Props) {
  const videoLink = onClick ? undefined : `/videos/${videoInfo.videoId}`

  return (
    <div className="space-y-2 relative group">
      <Link
        className="font-medium"
        to={videoLink}
        onClick={() => onClick?.(videoInfo.videoId)}
      >
        <div className="relative w-full">
          <img
            alt="Video thumbnail"
            className="aspect-video overflow-hidden rounded-lg object-cover w-full"
            height={225}
            src={videoInfo.thumbnails?.at(-1)?.url}
            width={400}
          />
          <p className="absolute bottom-2 left-2 bg-[#00000099] text-white rounded p-1 leading-none text-sm">
            {humanFileSize(videoInfo.file.size)}
          </p>
          <p className="absolute bottom-2 right-2 bg-[#00000099] text-white rounded p-1 leading-none text-sm">
            {formatSeconds(+videoInfo.lengthSeconds)}
          </p>
        </div>
        <span className="sr-only">Watch video</span>
      </Link>
      <h3 className="flex items-center">
        <Link
          className="hover:underline text-base font-semibold leading-none flex-grow mr-1"
          to={videoLink}
        >
          {videoInfo.title}
        </Link>

        <p className="text-sm text-muted-foreground w-12">
          {formatNumber(+videoInfo.viewCount)}
        </p>
        <Eye size={22} className="flex-shrink-0 text-muted-foreground" />
      </h3>

      {onDelete && (
        <Button
          onClick={async () => {
            const id = videoInfo.videoId || videoInfo.file.name
            await removeVideo(id)
            onDelete(id)
          }}
          size="icon"
          variant="secondary"
          className="absolute !mt-0 top-1 right-1 hidden group-hover:flex"
        >
          <X size={20} />
        </Button>
      )}
    </div>
  )
}
