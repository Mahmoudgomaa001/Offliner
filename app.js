import express from "express";
import fs from "fs";
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

  const info = await ytdl.getInfo(url);
  let format = ytdl.chooseFormat(info.formats, { quality: "highest" });

  res.attachment(videoName(info.videoDetails.title, format.container));
  res.header("Content-Length", format.contentLength);
  res.header("Content-Type", format.mimeType.split(";")[0]);

  ytdl.downloadFromInfo(info, { format }).pipe(res);
});

// Download file to disk then stream result to response
app.get("/video/download-first", async (req, res) => {
  const { url } = req.query;

  const info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: "highestvideo",
    filter: (f) => f.hasAudio && f.hasVideo,
  });
  const writeStream = fs.createWriteStream(TMP_FILE);

  res.attachment(info.videoDetails.title.concat(".", format.container));
  res.header("Content-Type", format.mimeType.split(";")[0]);

  const downloadStream = ytdl.downloadFromInfo(info, { format });

  downloadStream.pipe(writeStream);
  writeStream.on("error", (err) => {
    console.log(err);
  });

  downloadStream.on("end", () => {
    const size = fs.statSync("file").size
    res.header("Content-Length", size);
    const readStream = fs.createReadStream(TMP_FILE);

    readStream.on("end", () => {
      fs.unlink(TMP_FILE, console.log);
      res.end();
    });

    readStream.on("error", (err) => {
      console.log(err);
      fs.unlink(TMP_FILE, console.log);
    });

    readStream.pipe(res);
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running!");
});

function videoName(title, ext) {
  return title.concat(".", ext);
}
