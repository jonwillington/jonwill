import { SITE } from "../content/site";

// Google Analytics 4, production builds only, so local development never shows up in the stats.

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: Gtag;
  }
}

const enabled = import.meta.env.PROD && !!SITE.googleAnalytics;

/** Loads gtag.js once. Same as Google's snippet, added from code so the ID lives in site.ts. */
export function initAnalytics() {
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

/** An app opened (by tap, link or notification): counted as a page view of /ton#<app>. */
export function trackApp(id: string, name: string) {
  if (!enabled || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_title: `${name} · ${SITE.name}`,
    page_location: `${window.location.origin}${window.location.pathname}#${id}`,
  });
}
