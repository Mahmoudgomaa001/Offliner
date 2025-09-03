import AuthorCard from '@/components/AuthorCard'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { VideoInfoResponse } from '@/lib/api'
import { getOption, setOption } from '@/lib/options'
import { formatNumber } from '@/lib/utils'
import { Loader } from 'lucide-react'
import { ElementRef, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import SmallVideoCard from '@/components/SmallVideoCard'

export default function VideoPlayer() {
  const { videoId: videoIdFromParams } = useParams()
  const [searchParams] = useSearchParams()
  const videoIdFromQuery = searchParams.get('v')

  const videoId = videoIdFromParams || videoIdFromQuery

  const videoRef = useRef<ElementRef<'video'>>(null)
  const [videoDetails, setVideoDetails] = useState<VideoInfoResponse | null>(
    null
  )
  const [recommendedVideos, setRecommendedVideos] = useState<
    VideoInfoResponse[]
  >([])
  const [autoPlay, setAutoPlay] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!videoId) {
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/video/info?url=${videoId}`)
      .then((res) => res.json())
      .then((info) => {
        if (info.error) {
          throw new Error(info.error)
        }
        setVideoDetails(info)
        // Fetch recommended videos based on author
        fetch(`/api/search?q=${info.author.name}`)
          .then((res) => res.json())
          .then((results) => setRecommendedVideos(results.slice(0, 10)))
      })
      .catch((err) => {
        console.error('Failed to fetch video info', err)
        setVideoDetails(null) // Clear details on error
      })
      .finally(() => {
        setLoading(false)
      })
  }, [videoId])

  useEffect(() => {
    getOption('autoPlay').then(setAutoPlay)
  }, [])

  async function handleAutoPlayChange(checked: boolean) {
    setAutoPlay(checked)
    await setOption('autoPlay', checked)
  }

  useEffect(() => {
    if (videoRef.current && videoId) {
      videoRef.current.src = `/api/video/stream?id=${videoId}`
    }
  }, [videoRef, videoId])

  if (loading)
    return <Loader size={25} className="animate-spin block mx-auto my-12" />

  if (!videoDetails) return <p className="text-center">Video Not Found</p>

  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-grow">
          <video
            className="w-full max-h-[calc(100vh_-_200px)] bg-black"
            controls
            autoPlay
            ref={videoRef}
          ></video>

          <div className="mt-4">
            <h1 className="text-2xl font-bold">{videoDetails.title}</h1>
            <div className="text-sm text-muted-foreground mt-2">
              <b>{formatNumber(+videoDetails.viewCount)}</b> views
            </div>
          </div>

          <div className="mt-4">
            <AuthorCard author={videoDetails.author} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-96 lg:min-w-96">
          {!!recommendedVideos.length && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">More Videos</h2>
                <div className="flex items-center gap-2">
                  <Label htmlFor="auto-play" className="text-md">
                    Auto Play
                  </Label>
                  <Switch
                    id="auto-play"
                    onCheckedChange={handleAutoPlayChange}
                    checked={autoPlay}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {recommendedVideos.map((video) => (
                  <SmallVideoCard videoInfo={video} key={video.videoId} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
