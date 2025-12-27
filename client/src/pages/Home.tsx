export default function Home() {
  return (
    <div style={{ padding: "32px" }}>
      <h1>Krita Web App</h1>

      <p>Frontend: GitHub Pages</p>
      <p>Backend: Railway</p>

      <button
        style={{ marginTop: "16px", padding: "8px 16px" }}
        onClick={() => {
          window.open(
            "https://kritawebapp-production.up.railway.app/health",
            "_blank"
          );
        }}
      >
        Test Backend
      </button>
    </div>
  );
}

