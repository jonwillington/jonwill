// Downloads every Fontshare family (Regular, Medium and Bold, as woff2) into
// public/fonts/fs-<Family>/ for the dev font picker. Fontshare fonts are free for
// personal and commercial use, including on the web (ITF Free Font Licence or OFL).
//
//   node scripts/fetch-fontshare.mjs          # all families
//   node scripts/fetch-fontshare.mjs Sans     # only one category (Sans, Serif, Display…)
import { mkdir, writeFile, access } from "node:fs/promises";

const only = process.argv[2]?.toLowerCase();
const WEIGHTS = [400, 500, 700];

const fonts = [];
for (let offset = 0; ; offset += 100) {
  const res = await fetch(`https://api.fontshare.com/v2/fonts?limit=100&offset=${offset}`);
  const page = await res.json();
  fonts.push(...page.fonts);
  if (!page.has_more) break;
}

const jobs = [];
for (const f of fonts) {
  if (f.script !== "latin") continue;
  if (only && !f.category.toLowerCase().includes(only)) continue;
  const statics = f.styles.filter((s) => !s.is_variable && !s.is_italic);
  if (!statics.length) continue;
  const picked = new Map();
  for (const w of WEIGHTS) {
    const best = statics.reduce((a, b) =>
      Math.abs(b.weight.weight - w) < Math.abs(a.weight.weight - w) ? b : a,
    );
    picked.set(best.weight.weight, best);
  }
  const dir = `public/fonts/fs-${f.name}`;
  await mkdir(dir, { recursive: true });
  for (const s of picked.values()) {
    jobs.push({ url: `https:${s.file}.woff2`, path: `${dir}/${f.name.replace(/ /g, "")}-${s.weight.name}.woff2` });
  }
}

let done = 0;
await Promise.all(
  Array.from({ length: 12 }, async () => {
    while (jobs.length) {
      const { url, path } = jobs.pop();
      try {
        await access(path);
      } catch {
        const res = await fetch(url);
        if (res.ok) await writeFile(path, Buffer.from(await res.arrayBuffer()));
      }
      done++;
    }
  }),
);
console.log(`${done} files in public/fonts/fs-*`);
