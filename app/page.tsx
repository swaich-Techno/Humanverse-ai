export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1a1a1a 0%, #000000 55%, #000000 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          padding: "24px 50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>
          HumanVerse AI
        </h2>

        <div style={{ display: "flex", gap: "16px" }}>
          <button style={navBtn}>Login</button>
          <button style={goldBtn}>Start Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <p
          style={{
            color: "#b68cff",
            marginBottom: "12px",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}
        >
          NEXT GEN AI VIDEO CREATOR
        </p>

        <h1
          style={{
            fontSize: "72px",
            maxWidth: "1000px",
            lineHeight: "1.1",
            marginBottom: "20px",
          }}
        >
          Create Real Humans.
          <br />
          Turn Prompts Into Videos.
        </h1>

        <p
          style={{
            color: "#aaa",
            fontSize: "22px",
            maxWidth: "700px",
            marginBottom: "35px",
          }}
        >
          Generate lifelike characters, cinematic stories and reusable AI
          actors in minutes.
        </p>

        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
          <button style={goldBtn}>Launch Studio</button>
          <button style={navBtn}>Watch Demo</button>
        </div>
      </section>
    </main>
  );
}

const goldBtn = {
  background: "linear-gradient(90deg,#d4af37,#f5d76e)",
  color: "#000",
  border: "none",
  padding: "14px 28px",
  borderRadius: "14px",
  fontWeight: "bold",
  cursor: "pointer",
};

const navBtn = {
  background: "transparent",
  color: "#fff",
  border: "1px solid #333",
  padding: "14px 28px",
  borderRadius: "14px",
  cursor: "pointer",
};
