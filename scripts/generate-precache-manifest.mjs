import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "out");

if (!existsSync(outDir)) {
  console.warn("[precache-manifest] out/ not found, skipping (did `next build` run?)");
  process.exit(0);
}

function walk(dir, base = "") {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (statSync(full).isDirectory()) {
      files = files.concat(walk(full, rel));
    } else {
      files.push(`/${rel}`);
    }
  }
  return files;
}

const allFiles = walk(outDir);

// Hashed Next.js build output is safe to cache aggressively (filenames change
// when content changes). Route .txt files are the RSC payloads Next's client
// router fetches for soft navigation between pages.
const isPrecacheable = (f) =>
  f.startsWith("/_next/static/") ||
  ["/index.html", "/flashcards.html", "/practice-test.html", "/index.txt", "/flashcards.txt", "/practice-test.txt", "/manifest.webmanifest", "/favicon.ico"].includes(f) ||
  f.startsWith("/icons/") ||
  f.startsWith("/images/");

// The service worker serves whatever URL the browser actually requests, so map
// the *.html route files to the clean route paths (`/flashcards.html` -> `/flashcards`).
const routeAliases = {
  "/index.html": "/",
  "/flashcards.html": "/flashcards",
  "/practice-test.html": "/practice-test",
};

const manifest = Array.from(
  new Set(allFiles.filter(isPrecacheable).map((f) => routeAliases[f] ?? f))
);

writeFileSync(path.join(outDir, "precache-manifest.json"), JSON.stringify(manifest));
console.log(`[precache-manifest] wrote ${manifest.length} entries to out/precache-manifest.json`);
