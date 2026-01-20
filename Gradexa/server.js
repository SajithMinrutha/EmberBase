import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const PORT = process.env.PORT || 8080;
const ROOT = resolve(".");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
};

const send = async (res, filePath) => {
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
};

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(req.url || "/");
  const target = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = join(ROOT, target);
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      await send(res, join(filePath, "index.html"));
      return;
    }
    await send(res, filePath);
  } catch {
    await send(res, join(ROOT, "index.html"));
  }
});

server.listen(PORT, () => {
  console.log(`EmberTrack running on http://localhost:${PORT}`);
});
