// Renders public/<name>.jpg and public/<name>-dark.jpg for the Find My widget.
//
//   node scripts/render-map.mjs --lat 41.03 --lon 29.0 --zoom 11.35 --name istanbul-map
//
// Needs Chrome (set CHROME=/path/to/chrome if it isn't in the usual macOS place)
// and puppeteer-core: `npm i -D puppeteer-core`. Then point SITE.city.map at the files.
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const lat = arg("lat", "41.03");
const lon = arg("lon", "29.0");
const zoom = arg("zoom", "11.35");
const name = arg("name", "city-map");
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
// 728×340 at 1.5x = 1092×510, the widget at 3x.
await page.setViewport({ width: 728, height: 340, deviceScaleFactor: 1.5 });
for (const theme of ["light", "dark"]) {
  const url = `${pathToFileURL(resolve("scripts/map.html"))}?lat=${lat}&lon=${lon}&zoom=${zoom}&theme=${theme}`;
  await page.goto(url);
  await page.waitForFunction(() => document.title === "READY", { timeout: 60_000 });
  await new Promise((r) => setTimeout(r, 500));
  const out = `public/${name}${theme === "dark" ? "-dark" : ""}.jpg`;
  await page.screenshot({ path: out, type: "jpeg", quality: 82 });
  console.log("wrote", out);
}
await browser.close();
