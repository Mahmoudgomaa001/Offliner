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
    <main>
      <div className="mb-8 bg-primary -mt-10 px-4 md:px-0 pb-8">
        <h1 className="text-3xl md:text-4xl text-center pt-10 font-semibold mb-3 text-accent-foreground">
          Download YouTube Videos Easily
        </h1>
        <p className="mb-6 text-center text-accent-foreground">
          Paste a YouTube video URL and download it in high quality.
        </p>

        <form onSubmit={getInfo} className="mb-8 max-w-[700px] md:mx-auto">
          <div className="flex gap-4">
            <Input
              type="text"
              name="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={(e) => {
                e.target.select()
              }}
              placeholder="https://youtu.be/dQw4w9WgXcQ"
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

        {videoDetails && (
          <div className="max-w-[700px] md:mx-auto text-accent-foreground">
            <VideoDownloadCard videoInfo={videoDetails} />
          </div>
        )}
      </div>

      {/* <div className="max-w-[1400px] md:mx-auto">
        <RecentDownloads />
      </div> */}
    </main>
  )
}

export default Home
