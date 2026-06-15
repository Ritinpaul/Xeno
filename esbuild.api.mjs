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
  // Use ESM format — matches root package.json "type": "module"
  // The banner below injects createRequire so CJS deps (like postgres.js) work inside ESM
  format: "esm",
  outfile: "api/index.js",
  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath as _fileURLToPath } from 'url';
import { dirname as _dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = _fileURLToPath(import.meta.url);
const __dirname = _dirname(__filename);
`.trim(),
  },
  alias: {
    "@db": resolve(__dirname, "db"),
    "@contracts": resolve(__dirname, "contracts"),
    "@": resolve(__dirname, "src"),
  },
  // Only externalize Node built-ins — bundle everything else
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

console.log("✅ api/index.js bundled successfully");
