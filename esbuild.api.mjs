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
  format: "cjs",
  outfile: "api/index.cjs",
  alias: {
    "@db": resolve(__dirname, "db"),
    "@contracts": resolve(__dirname, "contracts"),
    "@": resolve(__dirname, "src"),
  },
  // Mark Node built-ins as external — they're always available on Vercel's Node runtime.
  // Everything else (postgres, drizzle-orm, zod, etc.) gets fully bundled into the output file
  // because Vercel serverless doesn't install node_modules for the api/ function at runtime.
  external: [
    "node:*",
    "fs", "path", "os", "crypto", "http", "https", "net", "tls",
    "stream", "url", "util", "zlib", "events", "buffer", "string_decoder",
    "dns", "querystring", "child_process", "worker_threads", "cluster",
    "readline", "assert", "vm", "timers", "perf_hooks", "async_hooks",
  ],
  sourcemap: false,
  treeShaking: true,
});

console.log("✅ api/index.cjs bundled successfully");
