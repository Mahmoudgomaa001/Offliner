import cp from 'child_process'
import ffmpeg from 'ffmpeg-static'
import ytdl from 'ytdl-core'

export async function downloadHighestQualityVideo(url, res) {
  const videoFilter = {
    filter: 'videoonly',
    quality: 'highestvideo',
    filter: (f) => f.container === 'mp4',
  }
  const audioFilter = {
    filter: 'audioonly',
    quality: 'highestaudio',
    filter: (f) => f.container === 'mp4' && !f.hasVideo,
  }

  const info = await ytdl.getInfo(url)
  let audioFormat = ytdl.chooseFormat(info.formats, audioFilter)
  let videoFormat = ytdl.chooseFormat(info.formats, videoFilter)

  res.header('Content-Type', videoFormat.mimeType.split(';')[0])

  const audio = ytdl(url, { format: audioFormat })
  const video = ytdl(url, { format: videoFormat })

  const mergeStream = mergeAudioAndVideo(audio, video)

  return mergeStream
}

export function mergeAudioAndVideo(audioStream, videoStream) {
  const ffmpegProcess = cp.spawn(
    ffmpeg,
    [
      // Remove ffmpeg's console spamming
      ['-loglevel', '0', '-hide_banner'],

      // Set inputs
      ['-i', 'pipe:3'],
      ['-i', 'pipe:4'],

      // Map audio & video from streams
      ['-map', '0:a'],
      ['-map', '1:v'],

      // Keep video encoding. encode audio as flac
      ['-c:v', 'copy'],
      ['-c:a', 'flac'],

      ['-movflags', 'isml+frag_keyframe'],

      ['-f', 'mp4', 'pipe:5'],
    ].flat(),
    {
      windowsHide: true,
      stdio: [
        /* Standard: stdin, stdout, stderr */
        'inherit',
        'inherit',
        'inherit',
        /* Custom: pipe:3, pipe:4, pipe:5 */
        'pipe',
        'pipe',
        'pipe',
      ],
    }
  )

  audioStream.pipe(ffmpegProcess.stdio[3])
  videoStream.pipe(ffmpegProcess.stdio[4])

  return ffmpegProcess.stdio[5]
}
