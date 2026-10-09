import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { META_BLOCK, metaTags, siteMeta } from "./src/content/meta";
import { SITE } from "./src/content/site";

const FONT_FILE = /\.(woff2?|otf|ttf)$/i;

/**
 * Dev only: GET /__fonts lists the font files in public/fonts/<Family>/ so the
 * font picker (src/dev/FontPicker.tsx) can try them on the page. Never in builds.
 */
function fontManifest(): Plugin {
  return {
    name: "font-manifest",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__fonts", (_req, res) => {
        const root = join(server.config.root, "public/fonts");
        const families: { family: string; files: string[] }[] = [];
        try {
          for (const dir of readdirSync(root)) {
            const path = join(root, dir);
            if (!statSync(path).isDirectory()) continue;
            const files = walk(path)
              .filter((f) => FONT_FILE.test(f))
              .map((f) => `/fonts/${f.slice(root.length + 1)}`);
            if (files.length) families.push({ family: dir, files });
          }
        } catch {
          // No public/fonts yet.
        }
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(families));
      });
    },
  };
}

/**
 * Writes the title and link-preview tags into index.html from content/site.ts.
 * SITE_URL and PAGE_PATH say where the site is served: by default your domain with the
 * page at /ton; the GitHub Pages workflow points them at the repo's Pages URL.
 */
function linkPreviews(): Plugin {
  const where = { origin: process.env.SITE_URL || `https://${SITE.domain}`, page: process.env.PAGE_PATH ?? "/ton" };
  return {
    name: "link-previews",
    transformIndexHtml: (html) => html.replace(META_BLOCK, metaTags(siteMeta(where))),
  };
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

export default defineConfig({
  // Served from the root (Cloudflare Pages) unless told otherwise: GitHub Pages sets
  // BASE_PATH=/<repo>/ (see .github/workflows/pages.yml in the template).
  base: process.env.BASE_PATH || "/",
  // Stamped on /public file URLs (lib/asset.ts) so replaced images aren't served from cache.
  define: { __BUILD__: JSON.stringify(Date.now().toString(36)) },
  plugins: [react(), tailwindcss(), fontManifest(), linkPreviews()],
});
