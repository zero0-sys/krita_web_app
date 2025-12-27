import { useEffect, useRef, useState } from "react";

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);

  const history = useRef<ImageData[]>([]);
  const historyIndex = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    saveHistory();
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(imageData);
    historyIndex.current++;
  };

  const startDraw = (e: React.MouseEvent) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    isDrawing.current = true;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    saveHistory();
  };

  const undo = () => {
    if (historyIndex.current <= 0) return;
    historyIndex.current--;
    restore();
  };

  const redo = () => {
    if (historyIndex.current >= history.current.length - 1) return;
    historyIndex.current++;
    restore();
  };

  const restore = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.putImageData(history.current[historyIndex.current], 0, 0);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, 800, 500);
    saveHistory();
  };

   const savePNG = () => {
  const canvas = canvasRef.current!;
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};


  return (
    <div style={{ padding: 16 }}>
      <h2>Drawing App</h2>

      <div style={{ marginBottom: 8 }}>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        <input
          type="range"
          min={1}
          max={30}
          value={size}
          onChange={e => setSize(Number(e.target.value))}
        />

        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={savePNG}>Save PNG</button>

      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ border: "1px solid black" }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
      />
    </div>
  );
}
