"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    try {
      setLoading(true);
      setImage("");

      // Save prompt to MongoDB
      await fetch("/api/save-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      // Generate AI image
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (data.success) {
        setImage(data.image);
      } else {
        alert("Failed to generate image.");
      }
    } catch (error) {
      alert("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1a1a1a 0%, #000000 55%, #000000 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "30px"
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "60px"
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>
          HumanVerse AI
        </h2>

        <button style={goldBtn}>Launch Studio</button>
      </nav>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          maxWidth: "950px",
          margin: "0 auto"
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            lineHeight: "1.1",
            marginBottom: "20px"
          }}
        >
          Turn Prompts Into
          <br />
          Real Human Characters
        </h1>

        <p
          style={{
            color: "#999",
            fontSize: "22px",
            marginBottom: "35px"
          }}
        >
          Create realistic AI humans for videos, stories and branding.
        </p>

        {/* Prompt Box */}
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            padding: "22px",
            borderRadius: "20px"
          }}
        >
          <textarea
            placeholder="Example: realistic punjabi male hero, cinematic lighting, village background"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              width: "100%",
              minHeight: "160px",
              background: "#000",
              color: "white",
              border: "1px solid #333",
              borderRadius: "14px",
              padding: "18px",
              fontSize: "18px",
              outline: "none",
              resize: "vertical"
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              ...goldBtn,
              width: "100%",
              marginTop: "18px",
              fontSize: "18px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Generating..." : "Generate Character"}
          </button>
        </div>

        {/* Output Image */}
        {image && (
          <div style={{ marginTop: "40px" }}>
            <h2 style={{ marginBottom: "20px", fontSize: "28px" }}>
              Generated Character
            </h2>

            <img
              src={image}
              alt="AI Character"
              style={{
                width: "100%",
                maxWidth: "520px",
                borderRadius: "18px",
                border: "1px solid #333",
                boxShadow: "0 0 30px rgba(255,255,255,0.08)"
              }}
            />
          </div>
        )}
      </section>
    </main>
  );
}

const goldBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#d4af37,#f5d76e)",
  color: "#000",
  border: "none",
  padding: "14px 28px",
  borderRadius: "14px",
  fontWeight: "bold",
  cursor: "pointer"
};
