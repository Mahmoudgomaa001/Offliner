import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader } from 'lucide-react'
import AudioCard from '@/components/AudioCard'
import { getAllVideos, localVideoDetails } from '@/lib/FileSystemManager'
import { reIndexCollection } from '@/lib/utils'

export default function Audios() {
  let [searchParams, setSearchParams] = useSearchParams()
  const [audios, setAudios] = useState<localVideoDetails[]>(null)
  const [currentAudio, setCurrentAudio] = useState<localVideoDetails>(null)
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string>(null)
  const [loading, setLoading] = useState(true)
  const audioId = searchParams.get('id')

  useEffect(() => {
    getAllVideos({ type: 'audio' })
      .then((audios) => {
        if (audioId) {
          const { current, arr } = reIndexCollection(audios, 'videoId', audioId)

          setCurrentAudio(current)
          setAudios(arr)
          setCurrentAudioSrc(URL.createObjectURL(current.file))
        } else {
          setAudios(audios)
        }
      })
      .finally(() => setLoading(false))
  }, [audioId])

  function handleAudioEnded() {
    const index = audios.findIndex((audio) => audio.videoId === audioId)
    const nextAudio = audios[(index + 1) % audios.length]

    URL.revokeObjectURL(currentAudioSrc)
    setSearchParams({ id: nextAudio.videoId })
  }

  function selectAudio(id: string) {
    setSearchParams({ id })
  }

  if (loading)
    return <Loader size={25} className="animate-spin block mx-auto my-12" />

  return (
    <main className="max-w-[var(--max-app-w)] mx-4 md:mx-auto">
      <div className="mb-8">
        <audio
          controls
          autoPlay
          src={currentAudioSrc}
          onEnded={handleAudioEnded}
        ></audio>
        <h1>{currentAudio?.title}</h1>
      </div>

      <div className="flex flex-col space-y-3">
        {audios.map((audio) => (
          <AudioCard
            key={audio.videoId}
            id={audio.videoId}
            imgSrc={audio.thumbnails.at(-1).url}
            title={audio.title}
            duration={+audio.lengthSeconds}
            onClick={selectAudio}
          />
        ))}
      </div>
    </main>
  )
}
