import { useEffect, useState } from 'react'
import { Download, Film, Music } from 'lucide-react'
import { captureException } from '@sentry/react'

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
import { getAudioSize, getVideoSize } from '@/lib/video'
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

  async function downloadStream(audioOnly = false) {
    const swReg = await navigator.serviceWorker?.ready
    const useBgFetch = await getOption('useBgFetch')
    const downloadable = {
      type: audioOnly ? 'audio' : 'video',
      size: audioOnly ? getAudioSize(videoInfo) : videoSize.size,
      accurate: audioOnly || videoSize.accurate,
    }

    if (swReg?.backgroundFetch && useBgFetch) {
      swReg.backgroundFetch
        .fetch(
          videoId,
          [
            `/api/video/download?url=${video_url}}&audioOnly=${
              audioOnly ? 'true' : ''
            }`,
          ],
          {
            title,
            downloadTotal: downloadable.accurate ? downloadable.size : null,
            icons: [{ src: videoInfo.videoDetails.thumbnails?.at(-1)?.url }],
          }
        )
        .then(() => {
          set(videoId, {
            ...videoInfo.videoDetails,
            downloadedAt: new Date(),
            type: downloadable.type,
          })

          toast({ title: 'Download has started in the background' })
        })
        .catch(onStreamError)

      return
    }

    // backgroundFetch not supported we do the normal download and write to disk
    const fileWriteStream = await createWriteStream(videoId)

    setFetching(true)
    try {
      const response = await fetch(
        `/api/video/download?url=${video_url}&audioOnly=${
          audioOnly ? 'true' : ''
        }`
      )
      let bytesLengthReceived = 0

      if (!response || response.status > 200) {
        onStreamError(
          `Failed to fetch. Status: ${response.status}`,
          fileWriteStream
        )
        return
      }

      const [stream1, stream2] = response.body.tee()

      const reader = stream2.getReader()
      reader.read().then(function getPercentFetched({ done, value }) {
        if (done) return

        bytesLengthReceived += value.byteLength
        setPercentFetched(
          Math.ceil((bytesLengthReceived * 100) / downloadable.size)
        )

        return reader.read().then(getPercentFetched)
      })

      stream1
        .pipeTo(fileWriteStream)
        .then(async () => {
          await set(videoId, {
            ...videoInfo.videoDetails,
            downloadedAt: new Date(),
            type: downloadable.type,
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
        .catch((err) => onStreamError(err, fileWriteStream))
    } catch (error) {
      onStreamError(error, fileWriteStream)
    } finally {
      setFetching(false)
    }
  }

  async function onStreamError(err: any, fs?: FileSystemWritableFileStream) {
    setPercentFetched(0)
    setFetching(false)

    captureException(err)
    await fs.close()
    await removeVideo(videoId)

    toast({
      title: 'An error occurred',
      description: err.message || err.toString(),
    })
  }

  return (
    <div className="flex gap-4 flex-wrap md:flex-nowrap ">
      <div className="relative w-full md:w-2/5">
        <img
          src={thumbnails.at(-1).url}
          alt={title}
          className="rounded-lg object-cover w-full h-full ring-2 ring-accent-foreground"
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
            <p className="flex items-center gap-2">
              <Film size={18} />
              {humanFileSize(videoSize.size).concat(
                videoSize.accurate ? '' : '~'
              )}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Music size={18} />
            {humanFileSize(
              +videoInfo.selectedFormat.highestAudioOnly.contentLength
            )}
          </p>
        </div>

        <div className="flex gap-2 relative">
          <div
            className="absolute h-1 bg-red-400 rounded-tl-sm rounded-tr-sm z-10 top-0"
            style={{ width: `${percentFetched}%` }}
          ></div>
          <Button
            variant="secondary"
            disabled={fetching}
            onClick={() => downloadStream(true)}
          >
            <Music />
          </Button>
          <Button
            className="flex gap-2 w-full flex-grow"
            disabled={fetching}
            onClick={() => downloadStream()}
            variant="secondary"
          >
            <Download />
            Download Video
          </Button>
        </div>
      </div>
    </div>
  )
}
