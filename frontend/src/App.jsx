import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";

function App() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=r1L35zxZQPE");
  const [videoDetails, setVideoDetails] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const getInfo = async (e) => {
    e?.preventDefault();

    const backendUrl = import.meta.env.VITE_API_BASE;
    setFetching(true);

    try {
      const response = await fetch(`${backendUrl}/video/info?url=${url}`);
      const data = await response.json();

      if (response.ok) {
        setVideoDetails(data);
      } else {
        setError(data.error.toString());
      }
    } catch (error) {
      setError(error.message || error.toString());
    } finally {
      setFetching(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    // description comes from being a share_target. it contains the url
    if (searchParams.has("description")) {
      setUrl(searchParams.get("description"));
      getInfo();
    }
  }, []);

  return (
    <>
      <Navbar />

      <main>
        <form onSubmit={getInfo}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />

          <button onClick={getInfo}>
            {fetching ? "Fetching..." : "Get Info"}
          </button>
          {error && <span className="error">{error}</span>}
        </form>

        {videoDetails && (
          <div className="video-details">
            <pre>{JSON.stringify(videoDetails, null, 2)}</pre>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
