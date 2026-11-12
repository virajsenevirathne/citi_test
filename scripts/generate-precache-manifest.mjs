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

// Every exported page: its HTML (served at the clean route path) plus its
// route .txt RSC payload, which Next's client router fetches for soft
// navigation. 404/_not-found and the Search Console verification file are not
// app pages. Other .txt files (llms.txt, robots.txt) are not RSC payloads and
// are left to the runtime cache.
const NON_PAGES = new Set(["/404.html", "/_not-found.html"]);
const pageFiles = allFiles.filter(
  (f) => f.endsWith(".html") && !NON_PAGES.has(f) && !/^\/google[0-9a-f]+\.html$/.test(f)
);
const fileSet = new Set(allFiles);

// The service worker serves whatever URL the browser actually requests, so map
// the *.html route files to the clean route paths (`/flashcards.html` -> `/flashcards`).
const routeOf = (f) => (f === "/index.html" ? "/" : f.replace(/\.html$/, ""));
const pageEntries = pageFiles.flatMap((f) => {
  const rsc = f.replace(/\.html$/, ".txt");
  return fileSet.has(rsc) ? [routeOf(f), rsc] : [routeOf(f)];
});

// Hashed Next.js build output is safe to cache aggressively (filenames change
// when content changes).
const isStaticAsset = (f) =>
  f.startsWith("/_next/static/") ||
  ["/manifest.webmanifest", "/favicon.ico"].includes(f) ||
  f.startsWith("/icons/") ||
  f.startsWith("/images/");

const manifest = Array.from(new Set([...pageEntries, ...allFiles.filter(isStaticAsset)]));

writeFileSync(path.join(outDir, "precache-manifest.json"), JSON.stringify(manifest));
console.log(`[precache-manifest] wrote ${manifest.length} entries (${pageFiles.length} pages) to out/precache-manifest.json`);
