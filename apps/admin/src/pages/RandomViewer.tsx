import { useEffect, useState } from "react";
import { API_BASE } from "../api";

export function RandomViewer() {
  const [url, setUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function shuffle() {
    try {
      const res = await fetch(`${API_BASE}/api/gif/random`);
      const data = await res.json();
      setUrl(data.url);
      setSeconds(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    shuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="viewer">
      {error && <p className="error">Error: {error}</p>}
      {url && <img src={url} alt="A random gif from the collection" />}
      <p className="muted">Watching for {seconds}s</p>
      <button onClick={shuffle}>Another one</button>
    </div>
  );
}
