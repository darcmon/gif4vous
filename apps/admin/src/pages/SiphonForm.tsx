import { useState } from "react";
import { API_BASE, authHeaders } from "../api";

export function SiphonForm() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(index: number) {
    tags.splice(index, 1);
    setTags(tags);
  }

  async function submit() {
    if (!sourceUrl.trim()) {
      setStatus("Paste a GIF url first.");
      return;
    }
    setStatus("Siphoning…");
    try {
      const res = await fetch(`${API_BASE}/api/admin/siphon`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: JSON.stringify({ sourceUrl, tags }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Failed (${res.status}): ${JSON.stringify(data)}`);
        return;
      }
      setStatus(`Siphoned ✓ — id ${data.gif.id}`);
      setSourceUrl("");
      setTags([]);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="form">
      <label>
        Direct .gif URL
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://…/something.gif"
        />
      </label>

      <label>
        Tags
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTag();
          }}
          placeholder="type a tag, press Enter"
        />
      </label>

      <div className="chips">
        {tags.map((tag, i) => (
          <span key={tag} className="chip">
            {tag}
            <button onClick={() => removeTag(i)} aria-label={`remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
      </div>

      <button className="primary" onClick={submit}>
        Siphon
      </button>

      {status && <p className="muted">{status}</p>}
    </div>
  );
}
