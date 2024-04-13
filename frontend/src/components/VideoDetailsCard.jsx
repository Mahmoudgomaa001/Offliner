export default function VideoCardDetails({ videoDetails }) {
  const { thumbnails, title, video_url } = videoDetails;
  const imgUrl = thumbnails[0].url;
  const backendUrl = import.meta.env.VITE_API_BASE;

  const params = new URLSearchParams(location.search);
  // this download the whole file on the server before streaming it
  const downloadFirst = params.has("download-first");

  return (
    <div>
      <img src={imgUrl} alt={title} />
      <h3>{title}</h3>
      <a
        href={`${backendUrl}/video/${
          downloadFirst ? "download-first" : "download"
        }?url=${video_url}`}
      ></a>
    </div>
  );
}
