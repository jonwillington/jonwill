// The mini CMS. One entry per icon on the home screen, in grid order.
// Edit copy, links and facts here; the phone and the detail panel read
// straight from this list. Icons live in /public/icons.
//
// These are blank placeholders: swap in your own apps. An entry with `icon: null`
// gets a monogram; point `icon` at a file in /public/icons for a real one. See
// content/types.ts for everything an entry can hold (screens, markets, a hiring
// card, a "coming soon" sign-up and more).
import { SITE } from "./site";
import type { AppEntry } from "./types";

export type { AppLink, MarketCell, Market, Destination, NetworkSite, AppEntry } from "./types";

/** The About page: you. Its words live in content/site.ts with the rest of you. */
export const ABOUT: AppEntry = {
  id: "about",
  name: SITE.firstName,
  title: "Welcome!",
  icon: SITE.photo,
  accent: "#cfcbd7",
  scheme: "light",
  tagline: SITE.about.tagline,
  tags: [],
  body: SITE.about.body,
  links: [{ label: "Connect on LinkedIn", href: SITE.linkedin.url }],
};

/**
 * Your day job: its own page, opened from the dock rather than sitting with your apps
 * on the home screen. Give it an entry like the apps below, or leave it null for none.
 */
export const WORK: AppEntry | null = null;

/** One placeholder app. Every one has the same sections, so the drawer reads the same way. */
const placeholder = (n: number, accent: string, scheme: "light" | "dark"): AppEntry => ({
  id: `app-${n}`,
  name: `App ${n}`,
  icon: null,
  accent,
  scheme,
  tagline: "One line on what it does.",
  tags: ["Platform", "Stack"],
  body: ["A sentence or two about the app: who it's for and what it does for them."],
  highlights: ["What it does best", "Something else worth knowing", "One more thing"],
  article: [
    { title: "What", body: ["What the app is, in plain words."] },
    { title: "Why", body: ["Why you made it: the problem, and what was missing."] },
    { title: "How", body: ["How it's built: the stack, the data and anything you'd do differently."] },
    { title: "Next", body: ["Where it's going."] },
  ],
  links: [{ label: "example.com", href: "https://example.com" }],
});

export const APPS: AppEntry[] = [
  placeholder(1, "#b59cf7", "light"),
  placeholder(2, "#ede8e2", "light"),
  placeholder(3, "#111113", "dark"),
  placeholder(4, "#fbf8f4", "light"),
  placeholder(5, "#1d3b53", "dark"),
  placeholder(6, "#ffd8a8", "light"),
];

/** The interests widget is built but hidden. Flip to bring it back. */
export const SHOW_INTERESTS = false;

export const INTERESTS: AppEntry = {
  id: "interests",
  name: "Interests",
  // Drawn in code (InterestsWidget), not an image.
  icon: null,
  accent: "#fbf8f4",
  scheme: "light",
  glow: "#ffb08a",
  tagline: "Three things you like.",
  tags: ["One", "Two", "Three"],
  body: ["A line about what you do when you're not building."],
  links: [{ label: "example.com", href: "https://example.com" }],
};

export const ALL_ENTRIES: AppEntry[] = [ABOUT, ...(WORK ? [WORK] : []), ...(SHOW_INTERESTS ? [INTERESTS] : []), ...APPS];
