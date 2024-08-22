import { formatSeconds } from '@/lib/utils'
import { Button } from './ui/button'

type Props = {
  id: string
  imgSrc: string
  title: string
  duration: number
  onClick: (id: string) => void
}

export default function AudioCard({
  id,
  imgSrc,
  title,
  duration,
  onClick,
}: Props) {
  return (
    <div className="flex gap-2 line-clamp-1">
      <Button
        variant="ghost"
        onClick={() => onClick(id)}
        className="w-16 h-10 p-0 relative group shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="absolute transition-opacity ease-in duration-400 opacity-0 group-hover:opacity-100"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
        <img
          src={imgSrc}
          alt={title}
          className="object-cover w-full h-full rounded-sm"
        />
      </Button>

      <div className="flex flex-col">
        <p>{title}</p>
        <p>{formatSeconds(duration)}</p>
      </div>
    </div>
  )
}
