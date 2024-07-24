import { getAllVideos } from '@/lib/FileSystemManager'
import useAsync from './hooks/useAsync'
import { Loader, VideoOff } from 'lucide-react'
import VideoCard from './VideoCard'

export default function RecentDownloads() {
  const { loading, value: videos } = useAsync(() => getAllVideos({ count: 5 }))

  if (loading)
    return <Loader size={25} className="animate-spin block mx-auto my-12" />

  if (!videos.length)
    return (
      <div className="flex gap-3 justify-center">
        <VideoOff />
        <p className="text-center">No Downloaded videos to show</p>
      </div>
    )

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mx-4 md:mx-8">
      {videos.map((v) => (
        <VideoCard videoInfo={v} key={v.title} />
      ))}
    </div>
  )
}
