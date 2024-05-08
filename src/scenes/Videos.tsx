import VideoCard from '@/components/VideoCard'
import { getAllVideos, localVideoDetails } from '@/lib/FileSystemManager'
import { useEffect, useState } from 'react'

export default function Videos() {
  const [videos, setVideos] = useState<localVideoDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideos()
  }, [])

  function loadVideos() {
    getAllVideos().then((videos) => {
      videos.sort((a, b) =>
        new Date(a.downloadedAt).getTime() > new Date(b.downloadedAt).getTime()
          ? -1
          : 1
      )

      setVideos(videos)
      setLoading(false)
    })
  }

  if (loading) return <p className="text-center">Loading...</p>

  if (!videos.length)
    return <p className="text-center">No videos downloaded yet!</p>

  return (
    <main className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mx-8">
      {videos.map((video) => (
        <VideoCard
          videoInfo={video}
          key={video.videoId}
          onDelete={loadVideos}
        />
      ))}
    </main>
  )
}
