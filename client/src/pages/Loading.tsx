import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Loading() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const t = setTimeout(() => {
      setLocation("/app");
    }, 1200);

    return () => clearTimeout(t);
  }, [setLocation]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Krita Web App</h1>
      <p>Loading drawing canvas…</p>
      <div style={{ marginTop: 12 }}>⏳</div>
    </div>
  );
}
