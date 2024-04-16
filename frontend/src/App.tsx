import { useState, useEffect } from 'react'
import { Loader, Search } from 'lucide-react'
import { videoInfo } from 'ytdl-core'
import Navbar from '@/components/Navbar'
import VideoDetailsCard from '@/components/VideoDetailsCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function App() {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=r1L35zxZQPE')
  const [videoDetails, setVideoDetails] = useState<videoInfo>()
  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getInfo = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    const backendUrl = import.meta.env.VITE_API_BASE
    setFetching(true)

    try {
      const response = await fetch(`${backendUrl}/video/info?url=${url}`)
      const data = await response.json()

      if (response.ok) {
        setVideoDetails(data)
      } else {
        setError(data.error.toString())
      }
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setFetching(false)
      setFetching(false)
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    // description comes from being a share_target. it contains the url
    const description = searchParams.get('description')

    if (description) {
      setUrl(description)
      getInfo()
    }
  }, [])

  return (
    <>
      <Navbar />

      <main>
        <form onSubmit={getInfo} className="flex gap-4 mb-8">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />

          <Button variant="outline">
            {fetching ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
          </Button>
          {error && <span className="error">{error}</span>}
        </form>

        {videoDetails && (
          <div className="video-details">
            <VideoDetailsCard videoDetails={videoDetails.videoDetails} />
          </div>
        )}
      </main>
    </>
  )
}

export default App
