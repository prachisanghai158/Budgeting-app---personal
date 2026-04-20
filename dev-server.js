/**
 * Local dev proxy — drop-in replacement for `wrangler dev`.
 * Reads SW_API_KEY from .dev.vars and proxies /splitwise/<path> → Splitwise API.
 * Sets rejectUnauthorized:false to work behind corporate TLS proxies.
 *
 * Usage: node dev-server.js
 * Listens on http://localhost:8787 (same port as wrangler dev)
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { HttpsProxyAgent } = require("https-proxy-agent");

// --- Load .dev.vars ---
function loadDevVars() {
  const varsPath = path.join(__dirname, ".dev.vars");
  if (!fs.existsSync(varsPath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(varsPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const env = { ...loadDevVars(), ...process.env };
const SW_API_KEY = env.SW_API_KEY;
const PORT = Number(env.PORT) || 8787;
const SPLITWISE_BASE = "secure.splitwise.com";

const proxyUrl =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
if (proxyAgent) console.log(`[proxy] Routing outbound via ${proxyUrl}`);

if (!SW_API_KEY || SW_API_KEY === "paste_your_splitwise_api_key_here") {
  console.error("❌  SW_API_KEY not set in .dev.vars — please add your Splitwise API key.");
  process.exit(1);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { ...CORS_HEADERS, "Content-Type": "application/json" });
  res.end(json);
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const match = url.pathname.match(/^\/splitwise\/(.+)$/);
  if (!match) {
    return sendJson(res, 400, { error: "Invalid path. Use /splitwise/<endpoint>" });
  }

  const splitwisePath = match[1];
  const upstreamPath = `/api/v3.0/${splitwisePath}${url.search}`;

  const options = {
    hostname: SPLITWISE_BASE,
    port: 443,
    path: upstreamPath,
    method: "GET",
    headers: {
      Authorization: `Bearer ${SW_API_KEY}`,
      Accept: "application/json",
    },
    rejectUnauthorized: false,
    ...(proxyAgent ? { agent: proxyAgent } : {}),
  };

  const startMs = Date.now();

  const proxy = https.request(options, (swRes) => {
    let data = "";
    swRes.on("data", (chunk) => (data += chunk));
    swRes.on("end", () => {
      const elapsed = Date.now() - startMs;
      console.log(`[proxy] GET ${url.pathname}${url.search} ${swRes.statusCode} (${elapsed}ms)`);
      res.writeHead(swRes.statusCode, {
        ...CORS_HEADERS,
        "Content-Type": swRes.headers["content-type"] || "application/json",
      });
      res.end(data);
    });
  });

  proxy.on("error", (err) => {
    const elapsed = Date.now() - startMs;
    console.error(`[proxy] ERROR ${url.pathname} (${elapsed}ms):`, err.message);
    sendJson(res, 502, { error: "Failed to reach Splitwise", detail: err.message });
  });

  proxy.end();
});

server.listen(PORT, () => {
  console.log(`\n✅  Splitwise proxy running on http://localhost:${PORT}`);
  console.log(`   Test: curl http://localhost:${PORT}/splitwise/get_current_user\n`);
});
