// One job: turn a sign-up from the site into an email to Jon. Called only by the
// Pages function at /api/waitlist (service binding), which has already checked the input.
import { EmailMessage } from "cloudflare:email";

type Env = { INBOX: SendEmail; FROM: string; TO: string };

export type Signup = { app: string; email: string; page?: string; country?: string };

/** Header values can't carry line breaks, or a sign-up could add headers of its own. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

function mime(env: Env, s: Signup): string {
  const fromAddress = env.FROM.match(/<([^>]+)>/)?.[1] ?? env.FROM;
  return [
    `From: ${env.FROM}`,
    `To: ${env.TO}`,
    `Reply-To: ${oneLine(s.email)}`,
    `Subject: ${oneLine(`${s.app}: ${s.email} wants to hear more`)}`,
    `Message-ID: <${crypto.randomUUID()}@${fromAddress.split("@")[1]}>`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    `${s.email} left their email on the ${s.app} "coming soon" form.`,
    "",
    `Page: ${s.page ?? "unknown"}`,
    `Country: ${s.country ?? "unknown"}`,
    "",
    "Reply to this email to answer them directly.",
  ].join("\r\n");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return new Response(null, { status: 405 });
    const s = (await request.json()) as Signup;
    try {
      await env.INBOX.send(new EmailMessage(env.FROM.match(/<([^>]+)>/)?.[1] ?? env.FROM, env.TO, mime(env, s)));
      return new Response(null, { status: 204 });
    } catch (err) {
      console.error("waitlist email failed", err);
      return new Response(null, { status: 502 });
    }
  },
};
