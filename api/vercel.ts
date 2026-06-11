import { handle } from "hono/vercel";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

export const config = {
  runtime: "nodejs20.x",
  // Increase max duration for AI calls (60s for Hobby, up to 800 for Pro)
  maxDuration: 60,
};

const app = new Hono().basePath("/api");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.use("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/*", (c) => c.json({ error: "Not Found" }, 404));

export default handle(app);
