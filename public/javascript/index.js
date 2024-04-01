const videoForm = document.forms.namedItem("video-form");
const detailsContainer = document.querySelector(".video-details");

videoForm.addEventListener("submit", handleFormSubmit);
document.addEventListener("DOMContentLoaded", () => {
  handleShareTargetParams();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
});

function handleShareTargetParams() {
  const searchParams = new URLSearchParams(location.search);

  console.log([...searchParams.entries()]);

  // description comes from being a share_target. it contains the url
  if (searchParams.has("description")) {
    videoForm.url.value = searchParams.get("description");
    videoForm.querySelector('[type="submit"]').click();
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const url = event.target.url.value;
  const response = await fetch(`/video/info?url=${url}`);
  const data = await response.json();

  if (response.ok) {
    renderVideoDetails(data);
  } else {
    videoForm.querySelector(".error").textContent = data.error.toString();
  }
}

function renderVideoDetails(details) {
  detailsContainer.innerHTML = "";

  renderVideoThumbnail(details);
  // renderVideoFormats(details);
}

function renderVideoThumbnail({ videoDetails }) {
  const { thumbnails, title, video_url } = videoDetails;
  const template = `
    <img src=${thumbnails[0].url}>
    <p>${title}</p>
    <a href=/video/download?url=${video_url} download>Download<a/>
  `;

  const div = document.createElement("div");
  div.classList.add("thumbnail");
  div.innerHTML = template;

  detailsContainer.insertAdjacentElement("afterbegin", div);
}

function renderVideoFormats({ formats }) {
  const div = document.createElement("div");
  div.classList.add("formats");

  formats
    .filter((format) => format.hasVideo)
    .filter((format) => format.contentLength)
    .filter((format) => format.container === "mp4")
    .forEach((format) => {
      div.append(renderFormat(format));
    });

  detailsContainer.append(div);
}

function renderFormat(format) {
  const div = document.createElement("div");

  div.innerHTML = `
    <span>Quality: ${format.qualityLabel}</span>
    <span>Size: ${(format.contentLength / 10 ** 6).toFixed(2)}MB</span>
    <span>Type: ${format.container}</span>

    <a href=${format.url} download>Download</a>
    <button
  `;

  return div;
}
