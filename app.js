import express from "express";
import fs from "fs";
import cp from "child_process";
import ffmpeg from "ffmpeg-static";
import path from "path";
import ytdl from "ytdl-core";

var app = express();

const __dirname = new URL(".", import.meta.url).pathname;
const TMP_FILE = "file";
app.use(express.static(path.join(__dirname, "./public")));

app.get("/video/info", async (req, res) => {
  const { url } = req.query;

  try {
    const info = await ytdl.getInfo(url);

    res.send(info);
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

app.get("/video/download", async (req, res) => {
  const { url } = req.query;

  const stream = await downloadHighestQualityVideo(url, res);

  stream.pipe(res);
});

// Download file to disk then stream result to response
app.get("/video/download-first", async (req, res) => {
  const { url } = req.query;

  const writeStream = fs.createWriteStream(TMP_FILE);
  writeStream.on("error", console.error);

  const downloadStream = await downloadHighestQualityVideo(url, res);

  downloadStream.pipe(writeStream);

  downloadStream.on("error", (err) => {
    console.error(err);
    res.end();
  });

  downloadStream.on("end", () => {
    const size = fs.statSync("file").size;
    res.header("Content-Length", size);

    const deleteTmpFile = () => fs.unlink(TMP_FILE, console.log);

    fs.createReadStream(TMP_FILE)
      .on("end", deleteTmpFile)
      .on("error", (err) => {
        console.log(err);
        deleteTmpFile();
      })
      .pipe(res);
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running!");
});

async function downloadHighestQualityVideo(url, res) {
  const videoFilter = {
    filter: "videoonly",
    quality: "highestvideo",
    filter: (f) => f.container === "mp4",
  };
  const audioFilter = {
    filter: "audioonly",
    quality: "highestaudio",
    filter: (f) => f.container === "mp4" && !f.hasVideo,
  };

  const info = await ytdl.getInfo(url);
  let audioFormat = ytdl.chooseFormat(info.formats, audioFilter);
  let videoFormat = ytdl.chooseFormat(info.formats, videoFilter);

  res.attachment(`${info.videoDetails.title}.${videoFormat.container}`);
  res.header("Content-Type", videoFormat.mimeType.split(";")[0]);

  const audio = ytdl(url, { format: audioFormat });
  const video = ytdl(url, { format: videoFormat });

  const mergeStream = mergeAudioAndVideo(audio, video);

  return mergeStream;
}

function mergeAudioAndVideo(audioStream, videoStream) {
  const ffmpegProcess = cp.spawn(
    ffmpeg,
    [
      // Remove ffmpeg's console spamming
      ["-loglevel", "0", "-hide_banner"],

      // Set inputs
      ["-i", "pipe:3"],
      ["-i", "pipe:4"],

      // Map audio & video from streams
      ["-map", "0:a"],
      ["-map", "1:v"],

      // Keep video encoding. encode audio as flac
      ["-c:v", "copy"],
      ["-c:a", "flac"],

      ["-movflags", "isml+frag_keyframe"],

      ["-f", "mp4", "pipe:5"],
    ].flat(),
    {
      windowsHide: true,
      stdio: [
        /* Standard: stdin, stdout, stderr */
        "inherit",
        "inherit",
        "inherit",
        /* Custom: pipe:3, pipe:4, pipe:5 */
        "pipe",
        "pipe",
        "pipe",
      ],
    }
  );

  audioStream.pipe(ffmpegProcess.stdio[3]);
  videoStream.pipe(ffmpegProcess.stdio[4]);

  return ffmpegProcess.stdio[5];
}
