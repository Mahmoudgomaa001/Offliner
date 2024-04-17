import { getVideo, localVideoDetails } from '@/lib/FileSystemManager'
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
    if (!videoRef.current) return

    const src = URL.createObjectURL(videoDetails.file)

    videoRef.current.src = src

    return () => URL.revokeObjectURL(src)
  }, [videoRef.current])

  if (!videoDetails) return <p>Video Not Found</p>

  return (
    <main className="mx-8">
      <video controls autoPlay ref={videoRef}></video>
    </main>
  )
}
