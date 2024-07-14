import { useEffect, useState } from 'react'
import { Download, Loader } from 'lucide-react'
import * as Sentry from '@sentry/react'

import {
  ExtendedVideoInfo,
  createWriteStream,
  removeVideo,
} from '@/lib/FileSystemManager'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { formatSeconds, humanFileSize } from '@/lib/utils'
import { set } from '@/lib/videoStore'
import { useNavigate } from 'react-router-dom'
import { getVideoSize } from '@/lib/video'
import { getOption } from '@/lib/options'

type Props = {
  videoInfo: ExtendedVideoInfo
}
export default function VideoDownloadCard({ videoInfo }: Props) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [fetching, setFetching] = useState(false)
  const [percentFetched, setPercentFetched] = useState(0)
  const { thumbnails, title, video_url, lengthSeconds, videoId } =
    videoInfo.videoDetails
  const videoSize = getVideoSize(videoInfo)

  useEffect(() => {
    setPercentFetched(0)
    setFetching(false)
  }, [videoId])

  async function downloadVideoStream() {
    const swReg = await navigator.serviceWorker?.ready
    const useBgFetch = await getOption('useBgFetch')

    if (swReg?.backgroundFetch && useBgFetch) {
      swReg.backgroundFetch
        .fetch(videoId, [`/api/video/download?url=${video_url}`], {
          title,
          downloadTotal: videoSize.accurate ? videoSize.size : null,
          icons: [{ src: videoInfo.videoDetails.thumbnails?.at(-1)?.url }],
        })
        .then((reg) => {
          setFetching(true)
          set(videoId, {
            ...videoInfo.videoDetails,
            downloadedAt: new Date(),
          })

          reg.onprogress = () => {
            const progress = Math.ceil((reg.downloaded * 100) / videoSize.size)
            setPercentFetched(progress)

            if (progress >= 100) setFetching(false)
          }
        })
        .catch((err) => {
          console.log(err)
          Sentry.captureException(err)
          toast({ title: err.message || err.toString() })
        })

      return
    }

    // backgroundFetch not supported we do the normal download and write to disk
    const fileWriteStream = await createWriteStream(videoId)

    setFetching(true)
    try {
      const response = await fetch(
        `/api/video/download?url=${video_url}`
      ).catch((err) => {
        console.log(err)
        Sentry.captureException(err)
        toast({ title: err.message || err.toString() })
      })
      let bytesLengthReceived = 0

      if (!response) return

      const [stream1, stream2] = response.body.tee()

      const reader = stream2.getReader()
      reader.read().then(function processText({ done, value }) {
        if (done) return

        bytesLengthReceived += value.byteLength
        setPercentFetched(
          Math.ceil((bytesLengthReceived * 100) / videoSize.size)
        )

        return reader.read().then(processText)
      })

      stream1.pipeTo(fileWriteStream).then(async () => {
        await set(videoId, {
          ...videoInfo.videoDetails,
          downloadedAt: new Date(),
        })

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
      Sentry.captureException(error)

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
          className="rounded-lg object-cover w-full h-full"
        />
        <p className="absolute bottom-2 right-2 bg-[#00000099] text-white rounded p-1 leading-none">
          {formatSeconds(+lengthSeconds)}
        </p>
      </div>

      <div className="flex flex-col justify-between gap-2 flex-grow">
        <div>
          <p className="text-lg font-semibold line-clamp-4" dir="auto">
            {title}
          </p>
          {!!videoSize.size && (
            <p>
              <span className="text-muted-foreground">size:</span>{' '}
              {!videoSize.accurate && <span>~</span>}
              {humanFileSize(videoSize.size)}
            </p>
          )}
        </div>

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
