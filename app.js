import express from "express";
import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";

var app = express();

const __dirname = new URL(".", import.meta.url).pathname;
const DOWNLOADED_FILENAME = "file";
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
  const format = ytdl.chooseFormat(info.formats, { quality: "highest" });
  const writeStream = fs.createWriteStream(DOWNLOADED_FILENAME);
  res.attachment(info.videoDetails.title.concat(".", format.container));
  res.header("Content-Length", format.contentLength);
  res.header("Content-Type", format.mimeType.split(";")[0]);

  const downloadStream = ytdl.downloadFromInfo(info, { format });

  downloadStream.pipe(writeStream);
  writeStream.on("error", (err) => {
    console.log(err);
  });

  downloadStream.on("end", () => {
    const readStream = fs.createReadStream(DOWNLOADED_FILENAME);

    readStream.on("end", () => {
      fs.unlink(DOWNLOADED_FILENAME, console.log);
      res.end();
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
