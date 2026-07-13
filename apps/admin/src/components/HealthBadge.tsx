import { useEffect, useState } from "react";
import { API_BASE } from "../api";

/**
 * ✅ REFERENCE COMPONENT — this one has NO planted bugs.
 * This is the canonical fetch-in-useEffect pattern. When debugging the
 * other pages, compare what they do against what this does.
 */
export function HealthBadge() {
  const [status, setStatus] = useState<"checking" | "up" | "down">("checking");

  useEffect(() => {
    // AbortController: if the component unmounts mid-request, cancel it so
    // we never call setState on an unmounted component.
    const controller = new AbortController();

    async function check() {
      try {
        const res = await fetch(`${API_BASE}/health`, {
          signal: controller.signal,
        });
        // Always branch on res.ok — fetch does NOT throw on 4xx/5xx.
        // It only throws on network-level failure (server down, CORS, DNS).
        setStatus(res.ok ? "up" : "down");
      } catch (err) {
        // Aborts surface as an exception too — that's expected, not an error.
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("down");
      }
    }

    check();
    return () => controller.abort(); // cleanup runs on unmount
  }, []); // empty deps = run once on mount. Deliberate, not forgotten.

  const color =
    status === "up" ? "#4ade80" : status === "down" ? "#f87171" : "#a3a3a3";

  return (
    <span style={{ color, fontSize: 13 }}>
      ● API {status === "checking" ? "…" : status}
    </span>
  );
}
