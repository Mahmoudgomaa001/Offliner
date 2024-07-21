import { getAllVideos } from '@/lib/FileSystemManager'
import useAsync from './hooks/useAsync'
import { Loader } from 'lucide-react'
import VideoCard from './VideoCard'

export default function RecentDownloads() {
  const { loading, value: videos } = useAsync(() => getAllVideos({ count: 5 }))

  if (loading)
    return <Loader size={25} className="animate-spin block mx-auto" />

  if (!videos.length) return null

  return (
    <>
      <h2 className="text-xl text-center mt-12">Latest Downloads</h2>
      <p className="text-slate-500 text-sm text-center mb-3">
        Check out the most recently downloaded videos
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mx-4 md:mx-8 mb-12">
        {videos.map((v) => (
          <VideoCard videoInfo={v} key={v.title} />
        ))}
      </div>
    </>
  )
}
