import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Loader, Search } from 'lucide-react'
import VideoDownloadCard from '@/components/VideoDownloadCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExtendedVideoInfo } from '@/lib/FileSystemManager'
import RecentDownloads from '@/components/RecentDownloads'

function Home() {
  let [searchParams] = useSearchParams()
  const [url, setUrl] = useState(searchParams.get('description') || '')
  const [videoDetails, setVideoDetails] = useState<ExtendedVideoInfo>()
  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getInfo = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    setFetching(true)

    try {
      const response = await fetch(`/api/video/info?url=${url}`)
      const data = await response.json()

      if (response.ok) {
        setVideoDetails(data)
        setError(null)
      } else {
        setError(data.error.toString())
      }
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    // description comes from being a share_target. it contains the url
    const description = searchParams.get('description')

    if (description) {
      getInfo()
    }
  }, [])

  return (
    <main className="max-w-[700px] mx-4 md:mx-auto">
      <form onSubmit={getInfo} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={(e) => {
              e.target.select()
            }}
            autoFocus
          />

          <Button variant="outline">
            {fetching ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
          </Button>
        </div>
        {error && (
          <span className="text-red-400 font-semibold text-sm">{error}</span>
        )}
      </form>


      <div className="max-w-[1400px] md:mx-auto">
        <RecentDownloads />
      </div>
    </main>
  )
}

export default Home
