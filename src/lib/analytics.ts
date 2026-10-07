import { SITE } from "../content/site";

// Google Analytics 4, production builds only, so local development never shows up in the stats.
// Every interaction goes through `track()`; see README "Analytics" for the full event list.
// In development, events are logged to the console instead (set `jonwill:debug-analytics`
// in localStorage to see them), so tagging can be checked without sending anything.

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: Gtag;
  }
}

export type Params = Record<string, string | number | boolean | undefined>;

const enabled = import.meta.env.PROD && !!SITE.googleAnalytics;
const debug = (() => {
  try {
    return import.meta.env.DEV && localStorage.getItem("jonwill:debug-analytics") === "1";
  } catch {
    return false;
  }
})();

/** Loads gtag.js once. Same as Google's snippet, added from code so the ID lives in site.ts. */
export function initAnalytics() {
  captureOutboundLinks();
  if (!enabled || window.gtag) return;
  const id = SITE.googleAnalytics!;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js reads the arguments object itself, so push it as-is.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id);
}

/** Sends one GA4 event. Undefined params are dropped. */
export function track(name: string, params: Params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
  if (debug) console.info(`[analytics] ${name} ${JSON.stringify(clean)}`);
  if (!enabled || !window.gtag) return;
  window.gtag("event", name, clean);
}

/** An app opened (by tap, link or notification): counted as a page view of /ton#<app>. */
export function trackApp(id: string, name: string) {
  if (debug) console.info("[analytics] page_view", id);
  if (!enabled || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_title: `${name} · ${SITE.name}`,
    page_location: `${window.location.origin}${window.location.pathname}#${id}`,
  });
}

/**
 * Every click on a link that leaves the site (http, mailto) becomes `outbound_click`, with
 * where it was on the page. Add `data-track="..."` to any element to name the area a link
 * sits in (the nearest one wins); otherwise the area is worked out from the page structure.
 */
function captureOutboundLinks() {
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const mail = href.startsWith("mailto:");
      if (!mail && !/^https?:/i.test(href)) return;
      let url: URL | null = null;
      try {
        url = new URL(href, window.location.href);
      } catch {
        // Ignore malformed links.
      }
      if (url && url.host === window.location.host) return;
      const area =
        a.closest<HTMLElement>("[data-track]")?.dataset.track ??
        (a.closest("[role=menu]") && "context_menu") ??
        (a.closest("[role=alertdialog]") && "alert") ??
        (a.closest("[data-vaul-drawer]") && "drawer") ??
        (a.closest("aside") && "panel") ??
        (a.closest("footer") && "footer") ??
        (a.closest("[data-night]") && "phone") ??
        "page";
      track(mail ? "email_click" : "outbound_click", {
        link_url: mail ? "mailto" : url?.href,
        link_domain: mail ? "email" : url?.host,
        link_text: (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 80),
        area,
        app: window.location.hash.slice(1) || undefined,
      });
    },
    true,
  );
}
