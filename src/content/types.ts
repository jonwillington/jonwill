// The shape of the content: what an app entry can hold. The data lives in apps.ts.

export type AppLink = {
  label: string;
  href: string;
};

/** One cell of a market × platform grid: a link, or a status with no link yet. */
export type MarketCell = { label: string; href?: string };

export type Market = {
  /** ISO 3166 code; drawn as a flag. */
  code: "gb" | "us" | "se" | "nl";
  name: string;
  web?: MarketCell;
  ios?: MarketCell;
  android?: MarketCell;
};

/** A reviewed place with its scores out of 100, linking to the full write-up. */
export type Destination = {
  name: string;
  country: string;
  /** ISO 3166 code; the flag is /flags/<code>.svg. */
  code: string;
  url: string;
  scores: { work: number; stay: number; value: number; fun: number };
};

/** A sister site in a network, e.g. the other city coffee maps. */
/**
 * `cityId` is the Filter API city, for live shop and roaster counts. `appStore` is set when
 * the city has an iOS app (mirrors `appStoreUrl` in filter-city-web/cities/<city>.ts).
 */
export type NetworkSite = { name: string; city: string; url: string; icon: string; cityId?: string; appStore?: string };

export type AppEntry = {
  id: string;
  name: string;
  /** The big heading on its page, when it should differ from the name (e.g. "Welcome!"). */
  title?: string;
  /** Path under /public, or null to draw a monogram instead. */
  icon: string | null;
  /** Background colour for the splash screen and the page when open. */
  accent: string;
  /** Whether `accent` needs light text (dark) or dark text (light). Defaults to dark. */
  scheme?: "dark" | "light";
  /** Optional colour for the light behind the phone, e.g. the icon's mark. */
  glow?: string;
  tagline: string;
  /** Short labels shown as chips, e.g. platform or stack. */
  tags: string[];
  /** Paragraphs for the detail panel. */
  body: string[];
  highlights?: string[];
  links: AppLink[];
  /** A social account to follow, shown as a button on the page and in the drawer. */
  follow?: AppLink;
  /** The app's App Store page: an "App Store" button in the drawer. */
  appStore?: string;
  /**
   * Not out yet: an "App Store" button that opens a "coming soon" modal instead,
   * with this line and an email field that mails Jon (POST /api/waitlist).
   */
  comingSoon?: string;
  /**
   * Real screenshots (804×1748, in /public/screens) shown inside the phone
   * when the app opens, in order. `scheme` is the screens' own look, which
   * sets the home indicator; `dark` swaps in for dark mode where it exists.
   */
  screens?: {
    scheme: "light" | "dark";
    light: string[];
    dark?: string[];
    /** One short line per screen, shown under the phone while that screen is up. */
    captions?: string[];
  };
  /**
   * A website to show in Safari on the phone instead of app screens: a full-page
   * capture of the mobile site (402pt wide at @2x, in /public/screens) that scrolls.
   */
  browser?: { url: string; page: string };
  /** Where the app is available, by market and platform. */
  markets?: Market[];
  /**
   * The long read in the "Learn more" drawer: titled sections, in the same
   * order for every app (What / Why / How / Next).
   */
  article?: { title: string; body: string[] }[];
  /** A side-by-side of two related products: what differs. */
  compare?: {
    title: string;
    intro: string;
    columns: [{ label: string; code: Market["code"] }, { label: string; code: Market["code"] }];
    rows: { label: string; values: [string, string] }[];
  };
  /** Top-rated places, highest overall first. */
  destinations?: { title: string; intro: string; items: Destination[] };
  /** A "we're hiring" card beside the text: a line or two, the key facts, and a link to the roles. */
  hiring?: { title: string; intro: string; facts: { label: string; value: string }[]; outro: string; cta: AppLink };
  /** A wider family of sites this app belongs to. */
  network?: { title: string; intro: string; sites: NetworkSite[] };
};
