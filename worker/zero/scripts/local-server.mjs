import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../src/index.js";

const port = 8000;
const repositoryRoot = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
const settings = await readSettings(new URL("../.dev.vars", import.meta.url));

if (!settings.OPENAI_API_KEY || !settings.OPENAI_SDA_API_KEY) {
  throw new Error("The local secret file is incomplete.");
}

const env = {
  ALLOWED_ORIGINS: `http://localhost:${port},http://127.0.0.1:${port}`,
  OPENAI_API_KEY: settings.OPENAI_API_KEY,
  OPENAI_SDA_API_KEY: settings.OPENAI_SDA_API_KEY,
  PILOT_ACCESS_CODE: settings.PILOT_ACCESS_CODE,
  SESSION_RATE_LIMITER: createLocalRateLimiter(8, 60_000),
  PILOT_RATE_LIMITER: createLocalRateLimiter(60, 60_000)
};

const server = createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url || "/", `http://${incoming.headers.host || `127.0.0.1:${port}`}`);

    if (["/api/look-at-yourself", "/api/self-directed-attention"].includes(url.pathname)) {
      const request = await toWebRequest(incoming, url);
      const response = await worker.fetch(request, env);
      await sendWebResponse(response, outgoing);
      return;
    }

    await serveStaticFile(url.pathname, outgoing);
  } catch {
    outgoing.writeHead(500, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    outgoing.end("The local pilot encountered an error.");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Local pilots ready at http://127.0.0.1:${port}/try-it/ and /self-directed-attention/`);
});

async function readSettings(url) {
  const text = await readFile(url, "utf8");
  return Object.fromEntries(text
    .split(/\r?\n/)
    .filter((line) => line && !line.trimStart().startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }));
}

async function toWebRequest(incoming, url) {
  const chunks = [];
  let size = 0;
  for await (const chunk of incoming) {
    size += chunk.length;
    if (size > 16_384) throw new Error("Request too large");
    chunks.push(chunk);
  }

  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  return new Request(url, {
    method: incoming.method,
    headers: incoming.headers,
    body,
    duplex: body ? "half" : undefined
  });
}

async function sendWebResponse(response, outgoing) {
  const headers = Object.fromEntries(response.headers.entries());
  outgoing.writeHead(response.status, headers);
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}

async function serveStaticFile(pathname, outgoing) {
  let requestedPath = decodeURIComponent(pathname);
  if (requestedPath.endsWith("/")) requestedPath += "index.html";

  const filePath = resolve(repositoryRoot, `.${requestedPath}`);
  if (filePath !== repositoryRoot && !filePath.startsWith(repositoryRoot + sep)) {
    outgoing.writeHead(403).end();
    return;
  }

  try {
    if (!(await stat(filePath)).isFile()) throw new Error("Not a file");
    const contents = await readFile(filePath);
    outgoing.writeHead(200, {
      "Content-Type": contentType(extname(filePath)),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    outgoing.end(contents);
  } catch {
    outgoing.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    outgoing.end("Not found");
  }
}

function createLocalRateLimiter(limit, period) {
  const counters = new Map();
  return {
    async limit({ key }) {
      const now = Date.now();
      const previous = counters.get(key);
      const entry = !previous || previous.resetAt <= now
        ? { count: 0, resetAt: now + period }
        : previous;
      entry.count += 1;
      counters.set(key, entry);
      return { success: entry.count <= limit };
    }
  };
}

function contentType(extension) {
  return ({
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
  })[extension.toLowerCase()] || "application/octet-stream";
}
