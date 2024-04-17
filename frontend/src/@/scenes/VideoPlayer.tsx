import AuthorCard from '@/components/AuthorCard'
import { getVideo, localVideoDetails } from '@/lib/FileSystemManager'
import { formatNumber } from '@/lib/utils'
import { ElementRef, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function VideoPlayer() {
  let { videoId } = useParams()
  const videoRef = useRef<ElementRef<'video'>>(null)
  const [videoDetails, setVideoDetails] = useState<localVideoDetails>(null)

  useEffect(() => {
    getVideo(videoId).then(setVideoDetails)
  }, [])

  useEffect(() => {
    if (!videoRef.current || !videoDetails) return

    const src = URL.createObjectURL(videoDetails.file)

    videoRef.current.src = src

    return () => URL.revokeObjectURL(src)
  }, [videoRef.current])

  if (!videoDetails) return <p>Video Not Found</p>

  return (
    <main className="px-4 w-full md:mx-auto md:w-4/5">
      <video className="w-full" controls ref={videoRef} autoPlay></video>

      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl mt-3">{videoDetails.title}</h1>
        <div>
          <b>{formatNumber(+videoDetails.viewCount)}</b> views
        </div>
      </div>

      <AuthorCard author={videoDetails.author} />
    </main>
  )
}
