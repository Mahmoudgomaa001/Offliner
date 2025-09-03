import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { VideoInfoResponse } from '@/lib/api'
import VideoCard from '@/components/VideoCard'
import { Loader } from 'lucide-react'

export default function Results() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')
  const [results, setResults] = useState<VideoInfoResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error)
        }
        setResults(data)
      })
      .catch((err) => {
        console.error(`Search failed for query "${query}":`, err)
        setResults([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [query])

  if (loading) {
    return <Loader size={25} className="animate-spin block mx-auto my-12" />
  }

  return (
    <main className="px-4 w-full md:mx-auto md:w-4/5">
      <h1 className="text-2xl font-bold my-4">
        Search Results for &quot;{query}&quot;
      </h1>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {results.map((video) => (
            <VideoCard videoInfo={video} key={video.videoId} />
          ))}
        </div>
      )}
    </main>
  )
}
