import { useEffect, useState } from "react";
import { API_BASE, authHeaders } from "../api";

type Gif = {
  id: string;
  url: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
};

export function Library() {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/gifs?limit=20`, {
          headers: authHeaders(),
        });
        if (!res.ok) {
          setError(`Request failed with status ${res.status}`);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setGifs(data.gifs);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    }
    load();
  });

  if (loading) return <p className="muted">Loading the collection…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (gifs.length === 0)
    return <p className="muted">Nothing here yet — go hunting.</p>;

  return (
    <div className="grid">
      {gifs.map((gif) => (
        <figure key={gif.id} className="card">
          <img src={gif.url} alt="" loading="lazy" />
          <figcaption>
            {gif.tags.length > 0 ? gif.tags.join(", ") : "untagged"}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
