/**
 * Cloudflare Worker — Splitwise API proxy
 *
 * Routes: GET /splitwise/<path>?<query>
 *   → https://secure.splitwise.com/api/v3.0/<path>?<query>
 *
 * The Splitwise API key is stored as an environment secret (SW_API_KEY).
 * Only GET requests are forwarded; everything else returns 405.
 */

const SPLITWISE_BASE = "https://secure.splitwise.com/api/v3.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Only allow GET
    if (request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);

    // Expect path like /splitwise/<splitwisePath>
    const match = url.pathname.match(/^\/splitwise\/(.+)$/);
    if (!match) {
      return new Response(JSON.stringify({ error: "Invalid path. Use /splitwise/<endpoint>" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const splitwisePath = match[1];
    const upstreamUrl = `${SPLITWISE_BASE}/${splitwisePath}${url.search}`;

    let upstreamResponse;
    try {
      upstreamResponse = await fetch(upstreamUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.SW_API_KEY}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Failed to reach Splitwise", detail: err.message }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const body = await upstreamResponse.text();

    return new Response(body, {
      status: upstreamResponse.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": upstreamResponse.headers.get("Content-Type") || "application/json",
      },
    });
  },
};
