import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));
const portIndex = process.argv.indexOf("--port");
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : 3100);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      return response.end("Method not allowed");
    }
    let path = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (path.split("/").some((segment) => segment.startsWith(".")))
      throw new Error("Private path");
    path =
      config.rewrites?.find((rewrite) => rewrite.source === path)
        ?.destination || path;
    if (path === "/") path = "/index.html";
    else if (config.cleanUrls && !extname(path)) path += ".html";
    const file = resolve(root, `.${path}`);
    if (!file.startsWith(root + sep) || !types[extname(file)])
      throw new Error("Unsupported path");
    const info = await stat(file);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": types[extname(file)],
      "Content-Length": info.size,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") return response.end();
    const stream = createReadStream(file);
    stream.on("error", () => response.destroy());
    stream.pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("페이지를 찾을 수 없습니다.");
  }
});
server.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Local preview: http://localhost:${port}/balance`),
);
