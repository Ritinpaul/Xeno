import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./server/lib/env.js"; // or hardcode URL

console.log("Connecting to:", env.databaseUrl);
const client = postgres(env.databaseUrl, { idle_timeout: 5 });
const db = drizzle(client);

async function test() {
  try {
    const start = Date.now();
    const result = await client`SELECT 1`;
    console.log("Connected in", Date.now() - start, "ms", result);
  } catch (e) {
    console.error("Error connecting:", e);
  } finally {
    await client.end();
  }
}
test();
