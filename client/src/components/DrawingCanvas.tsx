import { useRef, useState } from "react";

type Tool = "brush" | "eraser";

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(6);

  // ===== DRAW LOGIC =====
  const start = (e: React.MouseEvent) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const move = (e: React.MouseEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;

    ctx.lineCap = "round";
    ctx.lineWidth = size;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, 900, 600);
  };

  // ===== SAVE PNG =====
  const savePNG = () => {
    const canvas = canvasRef.current!;
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ===== UPLOAD TO BACKEND =====
  const uploadToServer = async () => {
    const canvas = canvasRef.current!;
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );

    const formData = new FormData();
    formData.append("image", blob, "drawing.png");

    await fetch("https://kritawebapp-production.up.railway.app/upload", {
      method: "POST",
      body: formData,
    });

    alert("Uploaded!");
  };

  // ===== UI =====
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>🎨 Krita Web App</h2>

      {/* TOOLBAR */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setTool("brush")}>🖌 Brush</button>
        <button onClick={() => setTool("eraser")}>🧽 Eraser</button>

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <input
          type="range"
          min={1}
          max={40}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />

        <button onClick={clear}>🗑 Clear</button>
        <button onClick={savePNG}>💾 Save PNG</button>
        <button onClick={uploadToServer}>☁ Upload</button>
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          cursor: tool === "eraser" ? "cell" : "crosshair",
        }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
      />
    </div>
  );
}
