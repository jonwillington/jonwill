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
};

export const ABOUT: AppEntry = {
  id: "about",
  name: "Jon",
  icon: "/me.jpg",
  accent: "#cfcbd7",
  scheme: "light",
  tagline: "Product design lead, currently in Istanbul.",
  tags: ["Design leadership", "Product design", "Side projects"],
  body: [
    "I'm a Group Product Design Manager at Deel, and I'm currently based in Istanbul.",
    "Outside work I design and build my own apps, end to end: the product, the design, the code and the data behind it. The rest of the icons on this phone are the ones I've been working on.",
  ],
  links: [
    { label: "Email", href: "mailto:hey@jonwill.ing" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jonathanwillington/" },
  ],
};

export const APPS: AppEntry[] = [
  {
    id: "deel",
    name: "Deel",
    icon: "/icons/deel.jpg",
    accent: "#b59cf7",
    scheme: "light",
    tagline: "My day job.",
    tags: ["Group Product Design Manager", "HR", "Payroll"],
    body: [
      "Deel is a global HR and payroll platform that helps companies hire, pay and manage people anywhere in the world.",
      "I'm a Group Product Design Manager there, leading design teams working across the product.",
    ],
    links: [
      { label: "deel.com", href: "https://www.deel.com" },
      { label: "App Store", href: "https://apps.apple.com/gb/app/deel-global-payroll-hr/id6478083155" },
    ],
  },
  {
    id: "ddbx",
    name: "ddbx",
    icon: "/icons/ddbx-glass.png",
    accent: "#ede8e2",
    scheme: "light",
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
    accent: "#ffffff",
    scheme: "light",
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
    icon: "/icons/gabridge-glass.png",
    accent: "#111113",
    scheme: "dark",
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
    accent: "#fbf8f3",
    scheme: "light",
    glow: "#d71f1f",
    tagline: "Speciality coffee in Istanbul.",
    tags: ["iOS", "Web", "SwiftUI"],
    body: [
      "Istanbrew is a guide to the best speciality coffee in Istanbul. Every shop is on one map, so you can see what's good near you, check whether it's open and get directions in a tap.",
      "Each area has a top pick to start with, and you can see who roasts the coffee, where the beans come from and which shops pour them.",
    ],
    highlights: ["The whole city, from Kadıköy to Karaköy", "Our Picks for each area", "Filter by roaster or origin"],
    links: [
      { label: "istanbrew.com", href: "https://istanbrew.com" },
      { label: "App Store", href: "https://apps.apple.com/gb/app/istanbrew/id6814183189" },
    ],
  },
];

export const INTERESTS: AppEntry = {
  id: "interests",
  name: "Interests",
  // Drawn in code (InterestsWidget), not an image.
  icon: null,
  accent: "#fbf8f4",
  scheme: "light",
  glow: "#ffb08a",
  tagline: "Coffee, cycling and walking.",
  tags: ["Coffee", "Cycling", "Walking"],
  body: [
    "Speciality coffee is why Istanbrew exists. I'm always after the next good cup.",
    "Cycling and walking are how I like to get to know a place.",
  ],
  links: [{ label: "istanbrew.com", href: "https://istanbrew.com" }],
};

export const ALL_ENTRIES: AppEntry[] = [ABOUT, INTERESTS, ...APPS];
