import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader } from 'lucide-react'
import AudioCard from '@/components/AudioCard'
import { getAllVideos } from '@/lib/FileSystemManager'
import { sortCollectionByDate } from '@/lib/utils'

import AudioPlayer from '@/components/AudioPlayer'
import { Video } from '@/lib/api'
import { getPlaylist } from '@/lib/playlist'

export default function Music() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [audios, setAudios] = useState<Video[]>(null)
  const [currentAudio, setCurrentAudio] = useState<Video>(null)
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string>(null)
  const [loading, setLoading] = useState(true)
  const audioId = searchParams.get('id')
  const playListId = searchParams.get('list')

  const getAudioList = useCallback(async () => {
    let listSource: Promise<Video[]>
    if (playListId) {
      listSource = getPlaylist(playListId).then((p) => p.videos)
    } else {
      listSource = getAllVideos({ type: 'audio' })
    }

    const audioList = await listSource
    const sortedAudios = sortCollectionByDate(audioList, 'downloadedAt', false)

    return sortedAudios
  }, [playListId])

  useEffect(() => {
    getAudioList()
      .then((audioList) => {
        setAudios(audioList)

        if (audioId) {
          const current = audioList.find((audio) => audio.videoId === audioId)

          setCurrentAudio(current)
          setCurrentAudioSrc(URL.createObjectURL(current.file))
        }
      })
      .finally(() => setLoading(false))
  }, [audioId, getAudioList])

  function handleAudioEnded() {
    playAdjacent('next')
  }

  function selectAudio(id: string) {
    searchParams.set('id', id)
    setSearchParams(searchParams)
  }

  function playAdjacent(adjacent: 'next' | 'previous') {
    const adjacentIndex = adjacent === 'next' ? 1 : -1

    const current = audios.findIndex((audio) => audio.videoId === audioId)
    const adjacentAudio = audios.at((current + adjacentIndex) % audios.length)

    URL.revokeObjectURL(currentAudioSrc)
    selectAudio(adjacentAudio.videoId)
  }

  function playPrevious() {
    playAdjacent('previous')
  }

  function playNext() {
    playAdjacent('next')
  }

  async function handleAudioDeleted(id: string) {
    const isPlaying = id === currentAudio.videoId

    if (isPlaying) playNext()
    else {
      const audioList = await getAudioList()
      setAudios(audioList)
    }
  }

  if (loading)
    return <Loader size={25} className="animate-spin block mx-auto my-12" />

  return (
    <main className="max-w-[var(--max-app-w)] mx-4 md:mx-auto">
      <div className="mb-8">
        <AudioPlayer
          src={currentAudioSrc}
          onEnded={handleAudioEnded}
          playNext={playNext}
          playPrevious={playPrevious}
          title={currentAudio?.title}
        />
      </div>

      <div className="space-y-3 overflow-hidden">
        {audios.map((audio) => (
          <AudioCard
            id={audio.videoId}
            key={audio.videoId}
            imgSrc={audio.thumbnail}
            title={audio.title}
            duration={+audio.lengthSeconds}
            onClick={() => selectAudio(audio.videoId)}
            onDelete={!playListId && handleAudioDeleted}
            selected={audio.videoId === audioId}
          />
        ))}
      </div>
    </main>
  )
}
