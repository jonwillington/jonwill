// The mini CMS. One entry per icon on the home screen, in grid order.
// Edit copy, links and facts here; the phone and the detail panel read
// straight from this list. Icons live in /public/icons.

export type AppLink = {
  label: string;
  href: string;
};

export type AppEntry = {
  id: string;
  name: string;
  /** Path under /public, or null to draw a monogram instead. */
  icon: string | null;
  /** Used for the splash screen and the panel tint. */
  accent: string;
  tagline: string;
  /** Short labels shown as chips, e.g. platform or stack. */
  tags: string[];
  /** Paragraphs for the detail panel. */
  body: string[];
  highlights?: string[];
  links: AppLink[];
};

export const ABOUT: AppEntry = {
  id: "about",
  name: "Jon",
  icon: "/me.jpg",
  accent: "#1f2937",
  tagline: "Group Product Design Manager at Deel.",
  tags: ["Design leadership", "Product design", "Side projects"],
  body: [
    "I'm a Group Product Design Manager at Deel, where I lead design teams working on the product.",
    "Outside work I design and build my own apps, end to end: the product, the design, the code and the data behind it. The icons on this phone are the ones I've been working on.",
  ],
  links: [
    { label: "Email", href: "mailto:hey@jonwill.ing" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jonathanwillington/" },
  ],
};

export const APPS: AppEntry[] = [
  {
    id: "ddbx",
    name: "ddbx",
    icon: "/icons/ddbx.jpg",
    accent: "#0f3d2e",
    tagline: "Director dealings, rated as they happen.",
    tags: ["iOS", "Web", "Android in progress", "Cloudflare"],
    body: [
      "ddbx tracks share purchases and sales by company insiders as they are filed. Each filing is scored against a checklist (who bought, how much, and whether the context backs it up) and given a rating from routine to significant.",
      "You can follow how each deal performs against the market over time and see which insiders made the right call. It covers the UK and the US, with Sweden and the Netherlands on the data side.",
    ],
    highlights: [
      "Live push alerts for new filings",
      "Ratings from routine to significant",
      "Performance tracking against benchmarks",
    ],
    links: [
      { label: "ddbx.uk", href: "https://ddbx.uk" },
      { label: "App Store (UK)", href: "https://apps.apple.com/gb/app/ddbx-uk/id6762196330" },
      { label: "App Store (US)", href: "https://apps.apple.com/gb/app/ddbx-us/id6772091960" },
    ],
  },
  {
    id: "holdall",
    name: "Holdall",
    icon: "/icons/holdall.jpg",
    accent: "#2b3a55",
    tagline: "Where to work remotely next.",
    tags: ["iOS", "Android", "React Native"],
    body: [
      "Holdall reviews more than 50 destinations for remote working trips. For each one it covers the best areas to stay, recommended coworking spaces, good coffee shops and things to do in your free time.",
    ],
    highlights: [
      "50+ destination guides",
      "Coworking spaces and coffee shops on a map",
      "Costs, air quality and peak season at a glance",
    ],
    links: [
      { label: "holdall.work", href: "https://www.holdall.work" },
      { label: "App Store", href: "https://apps.apple.com/gb/app/holdall/id6745562343" },
    ],
  },
  {
    id: "ga-bridge",
    name: "GA Bridge",
    icon: "/icons/gabridge.png",
    accent: "#111214",
    tagline: "All your GA4 properties on one screen.",
    tags: ["iOS", "SwiftUI", "On-device"],
    body: [
      "GA Bridge shows every Google Analytics 4 property you have on one screen: live users, today's users and page views, and a trend against yesterday up to the same hour.",
      "Tap a property for its top pages and a seven-day chart. Everything runs on the device with a read-only token, and there is no backend.",
    ],
    highlights: [
      "Live users from the last 30 minutes",
      "Fair day-on-day trend, hour for hour",
      "No server, no tracking",
    ],
    links: [{ label: "gabridge.app", href: "https://gabridge.app" }],
  },
  {
    id: "istanbrew",
    name: "Istanbrew",
    icon: "/icons/istanbrew.jpg",
    accent: "#6b3a1f",
    tagline: "Speciality coffee in Istanbul.",
    tags: ["iOS", "Web", "SwiftUI"],
    body: [
      "Istanbrew is a guide to the best speciality coffee in Istanbul. Every shop is on one map, so you can see what's good near you, check whether it's open and get directions in a tap.",
      "Each area has a top pick to start with, and you can see who roasts the coffee, where the beans come from and which shops pour them.",
    ],
    highlights: [
      "The whole city, from Kadıköy to Karaköy",
      "Our Picks for each area",
      "Filter by roaster or origin",
    ],
    links: [
      { label: "istanbrew.com", href: "https://istanbrew.com" },
      { label: "App Store", href: "https://apps.apple.com/gb/app/istanbrew/id6814183189" },
    ],
  },
];

export const ALL_ENTRIES: AppEntry[] = [ABOUT, ...APPS];
