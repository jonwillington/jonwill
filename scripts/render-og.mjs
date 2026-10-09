#!/usr/bin/env node
// Renders the link-preview cards (1200×630) into public/og: default.jpg for the site, and
// <id>.jpg for each page in content/apps.ts. Re-run after changing an app's name, line,
// icon or first screen, then deploy.
//
//   node scripts/render-og.mjs
//
// Starts the Vite dev server, opens /?og=<id> (src/og/OgCard.tsx) in Chrome for each card
// and captures it. Needs Chrome (set CHROME=/path/to/chrome if it isn't in the usual macOS place).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "public", "og");
const PORT = 5297;
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const server = spawn(path.join(ROOT, "node_modules", ".bin", "vite"), ["--port", String(PORT), "--strictPort"], {
  cwd: ROOT,
  stdio: "ignore",
});
const base = `http://localhost:${PORT}/`;
// With --strictPort Vite quits if the port is taken; don't capture whatever else is there.
let exited = false;
server.on("exit", () => (exited = true));

try {
  for (let i = 0; ; i++) {
    try {
      if (!exited && (await fetch(base)).ok) break;
    } catch {
      // Not up yet.
    }
    if (exited) throw new Error(`Vite couldn't start on port ${PORT}: is something else using it?`);
    if (i > 60) throw new Error("Vite didn't start");
    await new Promise((r) => setTimeout(r, 250));
  }

  const browser = await puppeteer.launch({ executablePath: chrome });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  // The card page lists every page's id (src/og/OgCard.tsx).
  await page.goto(`${base}?og=default`, { waitUntil: "networkidle0" });
  await page.waitForSelector("body[data-og-ids]");
  const ids = (await page.$eval("body", (b) => b.dataset.ogIds)).split(" ");

  fs.mkdirSync(OUT, { recursive: true });
  for (const id of ["default", ...ids]) {
    await page.goto(`${base}?og=${id}`, { waitUntil: "networkidle0" });
    await page.waitForSelector("body[data-og-ready]", { timeout: 15000 });
    // Let the entrance animations (splash icon, contact card) settle.
    await new Promise((r) => setTimeout(r, 900));
    const file = path.join(OUT, `${id}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 88 });
    console.log(`  ${path.relative(ROOT, file)}`);
  }
  await browser.close();
} finally {
  server.kill();
}
