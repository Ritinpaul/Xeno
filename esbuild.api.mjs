// esbuild.api.mjs
import { build } from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: ["server/vercel-entry.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "api/index.js",
  alias: {
    "@db": resolve(__dirname, "db"),
    "@contracts": resolve(__dirname, "contracts"),
    "@": resolve(__dirname, "src"),
  },
  external: [
    "@neondatabase/serverless",
    "drizzle-orm",
    "drizzle-orm/neon-http",
    "dotenv",
    "dotenv/config",
    "zod",
  ],
  sourcemap: false,
  treeShaking: true,
});

console.log("✅ api/index.js bundled successfully");
