import { useEffect, useState } from 'react'
import { MoreVideoDetails } from 'ytdl-core'
import { Download, Loader } from 'lucide-react'

import { createWriteStream, removeVideo } from '@/lib/FileSystemManager'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { formatSeconds } from '@/lib/utils'
import { set } from '@/lib/videoStore'
import { useNavigate } from 'react-router-dom'

type Props = {
  videoDetails: MoreVideoDetails
}
export default function VideoDownloadCard({ videoDetails }: Props) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [percentFetched, setPercentFetched] = useState(0)
  const { thumbnails, title, video_url, lengthSeconds, videoId } = videoDetails

  useEffect(() => {
    setPercentFetched(0)
  }, [videoDetails.videoId])

  async function downloadVideoStream() {
    const fileWriteStream = await createWriteStream(videoId)

    setFetching(true)
    try {
      const response = await fetch(`/api/video/download?url=${video_url}`)
      let bytesLengthReceived = 0
      const contentLength = +response.headers.get('Content-Length')

      const [stream1, stream2] = response.body.tee()

      const reader = stream2.getReader()
      reader.read().then(function processText({ done, value }) {
        if (done) return

        bytesLengthReceived += value.byteLength
        setPercentFetched(
          Math.round((bytesLengthReceived * 100) / contentLength)
        )

        return reader.read().then(processText)
      })

      stream1.pipeTo(fileWriteStream).then(async () => {
        await set(videoId, { ...videoDetails, downloadedAt: new Date() })

        toast({
          title: `"${title}" Has been downloaded`,
          action: (
            <ToastAction
              altText="Play video"
              onClick={() => {
                navigate(`/videos/${videoId}`)
              }}
            >
              Play
            </ToastAction>
          ),
        })
      })
    } catch (error) {
      await fileWriteStream.close()
      await removeVideo(videoId)

      toast({
        title: 'An error occurred',
        description: error.message || error.toString(),
      })
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="flex gap-4 flex-wrap md:flex-nowrap">
      <div className="relative w-full md:w-2/5">
        <img
          src={thumbnails.at(-1).url}
          alt={title}
          className="rounded-lg object-cover w-full"
        />
        <p className="absolute bottom-2 right-2 bg-[#00000099] text-white rounded p-1 leading-none">
          {formatSeconds(+lengthSeconds)}
        </p>
      </div>

      <div className="flex flex-col justify-between gap-2 flex-grow">
        <p className="text-lg font-semibold line-clamp-4">{title}</p>

        <Button
          className="flex gap-2 w-full md:w-auto"
          disabled={fetching}
          onClick={downloadVideoStream}
        >
          {fetching ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <Download />
          )}
          Download {!!percentFetched && <span>{percentFetched}%</span>}
        </Button>
      </div>
    </div>
  )
}
