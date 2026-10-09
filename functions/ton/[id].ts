// GET /ton/<app>: the same page as /ton, with that app's link-preview tags, so a shared
// link to one app previews as that app (its name, line and card from /public/og). The
// page itself turns the path into /ton#<app> and opens it, as a #link always has.
import { ALL_ENTRIES } from "../../src/content/apps";
import { META_BLOCK, entryMeta, metaTags } from "../../src/content/meta";
import { SITE } from "../../src/content/site";

type Env = { ASSETS: Fetcher };

export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
  const page = await env.ASSETS.fetch(new URL("/ton", request.url));
  const entry = ALL_ENTRIES.find((e) => e.id === params.id);
  if (!entry || !page.ok) return page;

  const html = (await page.text()).replace(
    META_BLOCK,
    metaTags(entryMeta(entry, { origin: `https://${SITE.domain}`, page: "/ton" })),
  );
  const headers = new Headers(page.headers);
  headers.delete("content-length");
  return new Response(html, { status: 200, headers });
};
