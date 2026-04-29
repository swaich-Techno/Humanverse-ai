"use client";

import { FormEvent, useEffect, useState } from "react";

type Mode = "image" | "video";
type Subject = "character" | "place" | "scene" | "product";
type Style = "cinematic" | "editorial" | "travel" | "luxury";
type AspectRatio = "1:1" | "3:4" | "16:9" | "9:16";

type GenerationResult = {
  url: string;
  mode: Mode;
};

const promptIdeas = [
  "Photorealistic Punjabi male lead, warm sunset light, premium fashion campaign, village road with cinematic depth.",
  "Luxury desert resort with realistic palm trees, still water reflections, twilight sky, travel magazine style.",
  "Young woman founder in a glass office, natural skin texture, soft studio light, startup brand video look."
];

const subjects: { value: Subject; label: string; note: string }[] = [
  {
    value: "character",
    label: "Real Person",
    note: "Portraits, heroes, influencers, actors and stylized humans."
  },
  {
    value: "place",
    label: "Place",
    note: "Homes, streets, resorts, cafes, offices and travel locations."
  },
  {
    value: "scene",
    label: "Scene",
    note: "Story moments with multiple details and cinematic composition."
  },
  {
    value: "product",
    label: "Product",
    note: "Brand visuals, ads, packaging shots and lifestyle campaigns."
  }
];

const styles: { value: Style; label: string }[] = [
  { value: "cinematic", label: "Cinematic" },
  { value: "editorial", label: "Editorial" },
  { value: "travel", label: "Travel" },
  { value: "luxury", label: "Luxury" }
];

const aspectRatios: AspectRatio[] = ["1:1", "3:4", "16:9", "9:16"];

export default function Home() {
  const [prompt, setPrompt] = useState(promptIdeas[0]);
  const [mode, setMode] = useState<Mode>("image");
  const [subject, setSubject] = useState<Subject>("character");
  const [style, setStyle] = useState<Style>("cinematic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3:4");
  const [duration, setDuration] = useState(5);
  const [motionHint, setMotionHint] = useState("");
  const [addSoundtrack, setAddSoundtrack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storageMessage, setStorageMessage] = useState(
    "Nothing has been generated yet."
  );
  const [result, setResult] = useState<GenerationResult | null>(null);

  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim()) {
      setError("Please describe what you want to create.");
      return;
    }

    setLoading(true);
    setError("");
    setStorageMessage("Generating now...");

    try {
      const response = await fetch("/api/generate-asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          mode,
          subject,
          style,
          aspectRatio,
          duration,
          motionHint,
          addSoundtrack
        })
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || contentType.includes("application/json")) {
        const payload = contentType.includes("application/json")
          ? await response.json()
          : { error: "Generation failed." };

        throw new Error(payload.error || "Generation failed.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setResult((current) => {
        if (current?.url) {
          URL.revokeObjectURL(current.url);
        }

        return {
          url: objectUrl,
          mode
        };
      });

      const storage = response.headers.get("x-humanverse-storage");
      const storageReason = response.headers.get("x-humanverse-storage-reason");

      if (storage === "mongodb") {
        setStorageMessage("Saved to MongoDB and ready to preview.");
      } else if (storageReason) {
        setStorageMessage(
          `Preview worked, but it was not saved to MongoDB yet: ${decodeURIComponent(
            storageReason
          )}`
        );
      } else {
        setStorageMessage("Preview worked, but MongoDB saving is not active yet.");
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Server error.";
      setError(message);
      setStorageMessage("Generation stopped before a preview was returned.");
    } finally {
      setLoading(false);
    }
  }

  function usePromptIdea(nextPrompt: string) {
    setPrompt(nextPrompt);
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">HumanVerse AI Studio</p>
          <h1>Create realistic characters, places, scenes and short videos.</h1>
          <p className="hero-text">
            This starter is built for GitHub, Vercel and MongoDB. Write what
            you want, choose image or video, and the app will save the request
            when your database is connected.
          </p>

          <div className="idea-row">
            {promptIdeas.map((idea) => (
              <button
                key={idea}
                className="idea-chip"
                onClick={() => usePromptIdea(idea)}
                type="button"
              >
                Use example
              </button>
            ))}
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-label">Best for</span>
            <strong>Photorealistic humans and locations</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Deploy stack</span>
            <strong>Next.js + Vercel + MongoDB</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Provider note</span>
            <strong>
              Add a Pollinations API key in Vercel for the most reliable
              generation.
            </strong>
          </div>
        </div>
      </section>

      <section className="studio-grid">
        <form className="studio-card" onSubmit={handleGenerate}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Prompt Studio</p>
              <h2>Tell the AI what to build</h2>
            </div>
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "Generating..." : `Generate ${mode}`}
            </button>
          </div>

          <label className="field">
            <span>Prompt</span>
            <textarea
              className="prompt-box"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: ultra realistic female fashion founder, rooftop skyline, premium clothing campaign, natural skin texture"
              value={prompt}
            />
          </label>

          <div className="option-grid">
            <label className="field">
              <span>Output Type</span>
              <div className="toggle-row">
                <button
                  className={mode === "image" ? "toggle active" : "toggle"}
                  onClick={() => setMode("image")}
                  type="button"
                >
                  Image
                </button>
                <button
                  className={mode === "video" ? "toggle active" : "toggle"}
                  onClick={() => setMode("video")}
                  type="button"
                >
                  Video
                </button>
              </div>
            </label>

            <label className="field">
              <span>Style</span>
              <select
                className="select-box"
                onChange={(event) => setStyle(event.target.value as Style)}
                value={style}
              >
                {styles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="subject-grid">
            {subjects.map((item) => (
              <button
                key={item.value}
                className={
                  subject === item.value
                    ? "subject-card subject-card-active"
                    : "subject-card"
                }
                onClick={() => setSubject(item.value)}
                type="button"
              >
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </button>
            ))}
          </div>

          <div className="option-grid">
            <label className="field">
              <span>Aspect Ratio</span>
              <select
                className="select-box"
                onChange={(event) =>
                  setAspectRatio(event.target.value as AspectRatio)
                }
                value={aspectRatio}
              >
                {aspectRatios.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {mode === "video" ? (
              <label className="field">
                <span>Video Seconds</span>
                <input
                  className="select-box"
                  max={10}
                  min={3}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  type="number"
                  value={duration}
                />
              </label>
            ) : (
              <div className="field hint-box">
                <span>Tip</span>
                <p>
                  Use image mode for thumbnails, character sheets, covers and
                  ads.
                </p>
              </div>
            )}
          </div>

          {mode === "video" && (
            <div className="option-grid">
              <label className="field">
                <span>Motion Hint</span>
                <input
                  className="select-box"
                  onChange={(event) => setMotionHint(event.target.value)}
                  placeholder="Slow push-in camera, soft hair movement, drifting fog"
                  type="text"
                  value={motionHint}
                />
              </label>

              <label className="checkbox-row">
                <input
                  checked={addSoundtrack}
                  onChange={(event) => setAddSoundtrack(event.target.checked)}
                  type="checkbox"
                />
                <span>Ask for soundtrack when the provider supports it</span>
              </label>
            </div>
          )}

          {error ? <p className="status error">{error}</p> : null}
          <p className="status">{storageMessage}</p>
        </form>

        <aside className="studio-card preview-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Preview</p>
              <h2>Your generated asset</h2>
            </div>
            {result ? (
              <a
                className="ghost-button"
                download={
                  result.mode === "image"
                    ? "humanverse-image.jpg"
                    : "humanverse-video.mp4"
                }
                href={result.url}
              >
                Download
              </a>
            ) : null}
          </div>

          {result ? (
            <div className="preview-frame">
              {result.mode === "image" ? (
                <img
                  alt="Generated AI result"
                  className="media-preview"
                  src={result.url}
                />
              ) : (
                <video
                  className="media-preview"
                  controls
                  playsInline
                  src={result.url}
                />
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                Your first preview will appear here after you click generate.
              </p>
            </div>
          )}

          <div className="preview-notes">
            <div>
              <span className="note-label">Best prompt shape</span>
              <p>
                Subject + clothing or materials + location + lighting + camera
                feel.
              </p>
            </div>
            <div>
              <span className="note-label">Video advice</span>
              <p>
                Keep videos short and descriptive so they finish faster on Vercel.
              </p>
            </div>
            <div>
              <span className="note-label">Database</span>
              <p>
                If MongoDB is connected, each request is stored in the
                <code>generations</code> collection.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
