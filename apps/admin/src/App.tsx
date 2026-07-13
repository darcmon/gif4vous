import { useState } from "react";
import { HealthBadge } from "./components/HealthBadge";
import { Library } from "./pages/Library";
import { RandomViewer } from "./pages/RandomViewer";
import { SiphonForm } from "./pages/SiphonForm";

type Tab = "library" | "random" | "siphon";

export default function App() {
  const [tab, setTab] = useState<Tab>("library");

  return (
    <div className="app">
      <header>
        <h1>gif4vous</h1>
        <HealthBadge />
        <nav>
          {(["library", "random", "siphon"] as const).map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === "library" && <Library />}
        {tab === "random" && <RandomViewer />}
        {tab === "siphon" && <SiphonForm />}
      </main>
    </div>
  );
}
