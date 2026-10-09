// Link previews: the <title>, description and Open Graph / Twitter tags for a page.
// Used at build time for the site's default (vite.config.ts) and per app by the Pages
// Function at /ton/<id> (functions/ton/[id].ts), so both write exactly the same tags.
import { SITE } from "./site";
import type { AppEntry } from "./types";

export type Meta = { title: string; description: string; url: string; image: string };

/** Where the site lives. `origin` serves /public files; app pages are `${origin}${page}/<id>`. */
export type Where = { origin: string; page: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
/** Copy can carry [text](url) links; previews want the plain words. */
const plain = (s: string) => s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1");

export const siteMeta = ({ origin, page }: Where): Meta => ({
  title: SITE.name,
  description: SITE.description,
  url: `${origin}${page || "/"}`,
  image: `${origin}/og/default.jpg`,
});

export const entryMeta = (entry: AppEntry, { origin, page }: Where): Meta => ({
  title: entry.id === "about" ? SITE.name : `${entry.name} · ${SITE.name}`,
  description: plain(entry.tagline || entry.body[0] || SITE.description),
  url: `${origin}${page}/${entry.id}`,
  image: `${origin}/og/${entry.id}.jpg`,
});

/** The tags, between markers so the Pages Function can swap them for an app's. */
export const metaTags = (m: Meta) =>
  [
    "<!-- meta -->",
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${esc(m.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(m.url)}" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(m.image)}" />`,
    "<!-- /meta -->",
  ].join("\n    ");

export const META_BLOCK = /<!-- meta -->[\s\S]*?<!-- \/meta -->/;
