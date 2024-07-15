import { formatNumber } from '@/lib/utils'
import { Author } from '@distube/ytdl-core'

type Props = {
  author: Author
}

export default function AuthorCard({ author }: Props) {
  return (
    <div className="flex gap-3">
      <img
        src={author.thumbnails?.[1]?.url}
        alt={author.user}
        className="rounded-full ring-2 ring-offset-2 ring-slate-300 h-14 w-14"
      />

      <div className="flex flex-col">
        <span className="font-medium text-slate-800">{author.name}</span>
        {!!author.subscriber_count && (
          <span className="text-muted-foreground">
            <b>{formatNumber(author.subscriber_count)}</b> subscribers
          </span>
        )}
      </div>
    </div>
  )
}
