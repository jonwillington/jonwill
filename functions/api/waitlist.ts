// POST /api/waitlist: the "coming soon" form. Checks the input, then hands it to the
// jonwill-mailer Worker (see mailer/), which emails Jon. Pages Functions can't send
// email themselves.

type Env = { MAILER?: Fetcher };

const APPS = new Set(["GA Bridge"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { app?: unknown; email?: unknown; page?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  // A hidden field people never see: anything in it came from a bot. Pretend it worked.
  if (body.company) return json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const app = typeof body.app === "string" ? body.app : "";
  if (!APPS.has(app) || email.length > 254 || !EMAIL.test(email)) return json({ error: "invalid" }, 400);

  if (!env.MAILER) {
    console.error("waitlist: MAILER binding missing");
    return json({ error: "unavailable" }, 503);
  }

  const res = await env.MAILER.fetch("https://mailer/", {
    method: "POST",
    body: JSON.stringify({
      app,
      email,
      page: typeof body.page === "string" ? body.page.slice(0, 200) : undefined,
      country: (request as { cf?: { country?: string } }).cf?.country,
    }),
  });
  return res.ok ? json({ ok: true }) : json({ error: "send_failed" }, 502);
};
