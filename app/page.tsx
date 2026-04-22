"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    try {
      const res = await fetch("/api/save-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (data.success) {
        alert("Prompt saved to MongoDB!");
        setPrompt("");
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      alert("Server error.");
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
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "bold"
          }}
        >
          HumanVerse AI
        </h2>

        <button style={goldBtn}>Launch Studio</button>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          maxWidth: "900px",
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
          Real Human Videos
        </h1>

        <p
          style={{
            color: "#999",
            fontSize: "22px",
            marginBottom: "35px"
          }}
        >
          Create AI characters, cinematic stories, and reusable actors.
        </p>

        {/* Prompt Box */}
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            padding: "20px",
            borderRadius: "20px",
            marginTop: "30px"
          }}
        >
          <textarea
            placeholder="Describe your character and video idea..."
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
            style={{
              ...goldBtn,
              marginTop: "18px",
              width: "100%",
              fontSize: "18px"
            }}
          >
            Generate Character + Video
          </button>
        </div>
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
}
