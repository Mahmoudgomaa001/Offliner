import { formatSeconds } from '@/lib/utils'
import { Button } from './ui/button'
import clsx from 'clsx'
import { CirclePlay, EllipsisVertical, Loader, Trash2 } from 'lucide-react'
import { Popover, PopoverTrigger } from './ui/popover'
import { PopoverContent } from '@radix-ui/react-popover'
import { removeVideo } from '@/lib/FileSystemManager'
import { useState } from 'react'

type Props = {
  id: string
  imgSrc: string
  title: string
  duration: number
  onClick: () => void
  onDelete?: (id: string) => void
  selected?: boolean
}

export default function AudioCard({
  id,
  imgSrc,
  title,
  duration,
  selected,
  onClick,
  onDelete,
}: Props) {
  const [loading, setLoading] = useState(false)
  return (
    <div
      className={clsx('flex gap-2', {
        'bg-secondary text-secondary-foreground rounded p-2': selected,
      })}
    >
      <Button
        variant="ghost"
        onClick={onClick}
        className="w-16 h-12 p-0 relative group shrink-0"
      >
        <CirclePlay />
        <img
          src={imgSrc}
          alt={title}
          className="object-cover w-full h-full rounded-sm"
        />
      </Button>

      <div className="flex flex-col">
        <Button
          className="line-clamp-1 p-0 h-auto"
          variant="link"
          onClick={onClick}
        >
          {title}
        </Button>
        <p>{formatSeconds(duration)}</p>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          {onDelete && (
            <Button size="icon" variant="link" className="ml-auto">
              <EllipsisVertical />
            </Button>
          )}
        </PopoverTrigger>

        <PopoverContent align="end">
          <Button
            onClick={async () => {
              setLoading(true)
              await removeVideo(id)
              onDelete(id)
              setLoading(false)
            }}
            variant="destructive"
            className="flex gap-2"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
            Delete
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
