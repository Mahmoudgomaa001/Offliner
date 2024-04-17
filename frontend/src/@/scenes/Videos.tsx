import { getAllVideos } from '@/lib/FileSystemManager'
import { useEffect, useState } from 'react'

export default function Videos() {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    getAllVideos().then(setVideos)
  }, [])

  return (
    <div>
      {videos.map((video) => {
        return <p key={video.title}>{video.title}</p>
      })}
    </div>
  )
}
