import { getAllVideos } from '@/lib/FileSystemManager'
import useAsync from './hooks/useAsync'
import { Loader, VideoOff } from 'lucide-react'
import SmallVideoCard from './SmallVideoCard'
import AudioCard from './AudioCard'
import { Fragment } from 'react/jsx-runtime'
import { useNavigate } from 'react-router-dom'

export default function RecentDownloads() {
  const navigate = useNavigate()
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
    <div className="flex flex-col gap-5">
      {videos.map((v) => (
        <Fragment key={v.videoId}>
          {v.type === 'audio' ? (
            <AudioCard
              imgSrc={v.thumbnail}
              title={v.title}
              duration={v.lengthSeconds}
              onClick={() => navigate(`/audio?id=${v.videoId}`)}
            />
          ) : (
            <SmallVideoCard
              imgSrc={v.thumbnail}
              title={v.title}
              lengthSeconds={v.lengthSeconds}
              videoId={v.videoId}
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}
