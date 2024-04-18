import AuthorCard from '@/components/AuthorCard'
import VideoCard from '@/components/VideoCard'
import { getAllVideos, localVideoDetails } from '@/lib/FileSystemManager'
import { formatNumber } from '@/lib/utils'
import { ElementRef, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function VideoPlayer() {
  let { videoId } = useParams()
  const videoRef = useRef<ElementRef<'video'>>(null)
  const [videoDetails, setVideoDetails] = useState<localVideoDetails>(null)
  const [videos, setVideos] = useState<localVideoDetails[]>([])

  useEffect(() => {
    getAllVideos().then((videos) => {
      const video = videos.find((v) => v.videoId === videoId)
      setVideoDetails(video)
      setVideos(videos.filter((v) => v.videoId !== videoId))
    })
  }, [videoId])

  function loadVideos() {
    getAllVideos().then((videos) => {
      setVideos(videos.filter((v) => v.videoId !== videoId))
    })
  }

  useEffect(() => {
    if (!videoRef.current || !videoDetails) return

    const src = URL.createObjectURL(videoDetails.file)

    videoRef.current.src = src

    return () => URL.revokeObjectURL(src)
  }, [videoRef.current, videoDetails?.videoId])

  if (!videoDetails) return <p>Video Not Found</p>

  return (
    <main className="px-4 w-full md:mx-auto md:w-4/5">
      <video className="w-full" controls ref={videoRef}></video>

      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl mt-3">{videoDetails.title}</h1>
        <div>
          <b>{formatNumber(+videoDetails.viewCount)}</b> views
        </div>
      </div>

      <AuthorCard author={videoDetails.author} />

      <h2 className="mt-8 mb-3 text-xl font-medium">More Videos</h2>

      <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {videos.map((video) => (
          <VideoCard
            videoInfo={video}
            key={video.videoId}
            onDelete={loadVideos}
          />
        ))}
      </div>
    </main>
  )
}
