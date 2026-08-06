import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve(process.cwd(), "dist");
const indexHtml = resolve(distDir, "index.html");
const notFoundHtml = resolve(distDir, "404.html");

if (!existsSync(indexHtml)) {
  console.error("spa-github-pages: dist/index.html not found — run vite build first");
  process.exit(1);
}

copyFileSync(indexHtml, notFoundHtml);
console.log("spa-github-pages: wrote dist/404.html");
