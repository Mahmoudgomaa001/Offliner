import { Eye, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { localVideoDetails, removeVideo } from '@/lib/FileSystemManager'
import { formatNumber, formatSeconds, humanFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Props = {
  videoInfo: localVideoDetails
  onDelete?: (videoId: string) => void
}
export default function VideoCard({ videoInfo, onDelete }: Props) {
  const videoLink = `/videos/${videoInfo.videoId}`

  return (
    <div className="space-y-2 relative group">
      <Link className="font-medium" to={videoLink}>
        <div className="relative w-full">
          <img
            alt="Video thumbnail"
            className="aspect-video overflow-hidden rounded-lg object-cover w-full"
            height={225}
            src={videoInfo.thumbnails?.at(-1)?.url}
            width={400}
          />
          <p className="absolute bottom-2 right-2 bg-[#00000099] text-white rounded p-1 leading-none">
            {formatSeconds(+videoInfo.lengthSeconds)}
          </p>
        </div>
        <span className="sr-only">Watch video</span>
      </Link>
      <h3 className="flex items-center">
        <Link
          className="hover:underline text-base font-semibold leading-none flex-grow"
          to={videoLink}
        >
          {videoInfo.title} ({humanFileSize(videoInfo.file.size)})
        </Link>

        <p className="text-sm text-muted-foreground w-12 m-l-2">
          {formatNumber(+videoInfo.viewCount)}
        </p>
        <Eye size={22} className="flex-shrink-0 text-muted-foreground" />
      </h3>

      <Button
        onClick={async () => {
          const id = videoInfo.videoId || videoInfo.file.name
          await removeVideo(id)
          onDelete?.(id)
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
