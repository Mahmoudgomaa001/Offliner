import express from "express";
import path from "path";
import ytdl from "ytdl-core";

var app = express();

const __dirname = new URL(".", import.meta.url).pathname;
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

  res.attachment(info.videoDetails.title.concat(".", format.container));
  res.header("Content-Length", format.contentLength);
  res.header("Content-Type", format.mimeType.split(";")[0]);

  const now = Date.now()
  const stream = ytdl.downloadFromInfo(info, { format });

  stream.on("progress", (chunkLength, downloaded, total) => {
    const percent = downloaded / total;
    const timeDiff = (Date.now() - now) / 1000
    console.log("downloading", `${(percent * 100).toFixed(1)}% - ${timeDiff}s`);
  });

  stream.pipe(res);
  ytdl.downloadFromInfo(info, { format }).pipe(res);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running!");
});
