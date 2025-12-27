import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 🔥 STATIC FILES (DOWNLOAD AREA)
  // Railway + local: selalu pakai dist/public
  const staticPath = path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ ok: true, filename: req.file?.filename });
});


  // SPA fallback (kalau perlu)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Serving static from ${staticPath}`);
  });
}

startServer().catch(console.error);
