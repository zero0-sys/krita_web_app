import { useEffect, useRef, useState } from "react";

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);

  const history = useRef<ImageData[]>([]);
  const historyIndex = useRef(-1);

   const lastPoint = useRef<{ x: number; y: number; time: number } | null>(null);

   const [layers, setLayers] = useState<number[]>([0]);
   const [activeLayer, setActiveLayer] = useState(0);

   const [color, setColor] = useState("#000000");
   const [r, setR] = useState(0);
   const [g, setG] = useState(0);
   const [b, setB] = useState(0);
   
   const [scale, setScale] = useState(1);
   const [offset, setOffset] = useState({ x: 0, y: 0 });
   const isPanning = useRef(false);


  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    saveHistory();
  }, []);

  useEffect(() => {
  const hex =
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  setColor(hex);
}, [r, g, b]);

   function cmykToRgb(c: number, m: number, y: number, k: number) {
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}



  const saveHistory = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(imageData);
    historyIndex.current++;
  };

  const startDraw = (e: React.MouseEvent) => {
  const canvas = canvasRef.current!;
  const ctx = canvas.getContext("2d")!;

  isDrawing.current = true;
  ctx.beginPath();
  ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

  lastPoint.current = {
    x: e.nativeEvent.offsetX,
    y: e.nativeEvent.offsetY,
    time: Date.now(),
  };
};

  const draw = (e: React.MouseEvent) => {
  if (!isDrawing.current || !lastPoint.current) return;

  const canvas = canvasRef.current!;
  const ctx = canvas.getContext("2d")!;
  const now = Date.now();

  const dx = e.nativeEvent.offsetX - lastPoint.current.x;
  const dy = e.nativeEvent.offsetY - lastPoint.current.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const dt = now - lastPoint.current.time;

  const speed = dist / Math.max(dt, 1);
  const dynamicSize = Math.max(1, size - speed * 5);

  ctx.lineWidth = dynamicSize;
  ctx.lineCap = "round";

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }

  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  ctx.stroke();

  lastPoint.current = {
    x: e.nativeEvent.offsetX,
    y: e.nativeEvent.offsetY,
    time: now,
  };
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

   onWheel={(e) => {
  e.preventDefault();
  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  setScale(s => Math.min(5, Math.max(0.2, s * zoom)));
   }} 

   const startPan = (e: React.MouseEvent) => {
  if (e.button === 1 || e.ctrlKey) {
    isPanning.current = true;
  }
};

const pan = (e: React.MouseEvent) => {
  if (!isPanning.current) return;
  setOffset(o => ({
    x: o.x + e.movementX,
    y: o.y + e.movementY,
  }));
};

const endPan = () => {
  isPanning.current = false;
};



    type Tool = "brush" | "eraser";
    const [tool, setTool] = useState<Tool>("brush");
    const [tool, setTool] = useState<"brush" | "eraser" | "picker">("brush");
       


     const pickColor = (e: React.MouseEvent) => {
  const canvas = canvasRef.current!;
  const ctx = canvas.getContext("2d")!;
  const pixel = ctx.getImageData(
    e.nativeEvent.offsetX,
    e.nativeEvent.offsetY,
    1,
    1
  ).data;

  setR(pixel[0]);
  setG(pixel[1]);
  setB(pixel[2]);
};
    
     if (tool === "picker") {
  pickColor(e);
  return;
}

   const savePNG = () => {
  const canvas = canvasRef.current!;
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

    const uploadToServer = async () => {
  const canvas = canvasRef.current!;
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob(b => resolve(b!), "image/png")
  );

  const formData = new FormData();
  formData.append("image", blob, "drawing.png");

  await fetch("https://kritawebapp-production.up.railway.app/upload", {
    method: "POST",
    body: formData,
  });

  alert("Uploaded!");
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
        <button onClick={uploadToServer}>Save to Server</button>
        <button onClick={() => setTool("brush")}>Brush</button>
        <button onClick={() => setTool("eraser")}>Eraser</button>
        <button onClick={() => setTool("picker")}>🎯 Eyedropper</button>


        <button
        onClick={() => {
           const id = Date.now();
           setLayers([...layers, id]);
          setActiveLayer(id);
         }}
       >
          + Layer
        </button>
          {layers.map((l) => (
  <button key={l} onClick={() => setActiveLayer(l)}>
    Layer {l === activeLayer ? "★" : ""}
  </button>

     <button
  onClick={() => {
    const rgb = cmykToRgb(0, 1, 1, 0); // contoh merah
    setR(rgb.r);
    setG(rgb.g);
    setB(rgb.b);
  }}
>
  CMYK Red
</button>

))}

      </div>

       <div>
  <label>R</label>
  <input type="range" min={0} max={255} value={r} onChange={e => setR(+e.target.value)} />
  <label>G</label>
  <input type="range" min={0} max={255} value={g} onChange={e => setG(+e.target.value)} />
  <label>B</label>
  <input type="range" min={0} max={255} value={b} onChange={e => setB(+e.target.value)} />
</div>

      <div style={{ position: "relative" }}>
  {layers.map((layer) => (
    <canvas
      key={layer}
      ref={layer === activeLayer ? canvasRef : null}
      width={800}
      height={600}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        border: layer === 0 ? "1px solid #ccc" : "none",
        pointerEvents: layer === activeLayer ? "auto" : "none",
      }}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={endDraw}
      onMouseLeave={endDraw}
    />
  ))}
    </div>

       <div
    style={{
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: "0 0",
      position: "relative",
      width: 800,
      height: 600,
    }}
  >

  );
}
