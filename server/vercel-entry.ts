import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/router";
import { createContext } from "../server/context";
import type { IncomingMessage, ServerResponse } from "http";

export const config = {
  maxDuration: 60,
};

const app = new Hono().basePath("/api");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.get("/ping", (c) => c.json({ message: "pong" }));

app.use("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/*", (c) => c.json({ error: "Not Found" }, 404));

// Vercel Node.js runtime handler — converts Node IncomingMessage/ServerResponse
// to Web API Request/Response and back (Hono uses Web APIs internally)
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  // Build the full URL from the incoming request
  const host = req.headers.host || "localhost";
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const url = `${proto}://${host}${req.url}`;

  // Collect the request body
  const bodyChunks: Uint8Array[] = [];
  for await (const chunk of req) {
    bodyChunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const body =
    req.method !== "GET" && req.method !== "HEAD" && bodyChunks.length > 0
      ? Buffer.concat(bodyChunks)
      : undefined;

  // Build a Web API Request
  const headers = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      val.forEach((v) => headers.append(key, v));
    } else {
      headers.set(key, val);
    }
  }

  const webReq = new Request(url, {
    method: req.method,
    headers,
    body,
    // @ts-ignore — Node.js fetch needs this to allow streaming bodies
    duplex: "half",
  });

  // Call Hono's fetch handler
  const webRes = await app.fetch(webReq);

  // Write the Web Response back to Node ServerResponse
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const responseBody = await webRes.arrayBuffer();
  res.end(Buffer.from(responseBody));
}
