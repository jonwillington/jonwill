// The mini CMS. One entry per icon on the home screen, in grid order.
// Edit copy, links and facts here; the phone and the detail panel read
// straight from this list. Icons live in /public/icons.
import { SITE } from "./site";

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

export const APPS: AppEntry[] = [
  {
    id: "ddbx",
    name: "ddbx.uk",
    icon: "/icons/ddbx-glass.png",
    accent: "#ede8e2",
    scheme: "light",
    tagline: "UK director dealings, rated as they happen.",
    tags: ["iOS", "Web", "Android", "Cloudflare"],
    body: [
      "Tracks share dealings by directors of UK-listed companies as they are filed, and rates each one from routine to significant.",
    ],
    highlights: [
      "Live push alerts for new filings",
      "API, MCP and a Claude connector",
      "Ratings from routine to significant",
      "Performance tracking against benchmarks",
    ],
    article: [
      {
        title: "What",
        body: [
          "[ddbx](https://ddbx.uk) follows what company directors do with their own money. When a director buys or sells shares in their company, they have to say so publicly. ddbx picks up those filings within minutes, screens out the routine ones and rates the rest from minor to significant, with a written analysis of why.",
          "This is the UK edition, built on the RNS announcements directors and senior managers (PDMRs) have to make. It tracks how each deal performs against the FTSE afterwards, and Sweden and the Netherlands run on the same platform in preview.",
        ],
      },
      {
        title: "Why",
        body: [
          "I built ddbx to answer a question I'd been curious about for years: is there any real value in following what directors do with their own shares?",
          "I've been investing actively since 2015, and I've followed plenty of trades on a hunch, with mixed luck. ddbx is my attempt at something more methodical. Every filing goes through the same process, and the analysis weighs the case for and against using as many relevant sources as it needs. The aim is a balanced view, not a sensational one.",
          "It also solves a practical problem. Keeping up with disclosures by hand is tiring, and alongside everything else in life you'll always miss the one trade that really moves.",
          "Everything is free on the [website](https://ddbx.uk). The [iPhone](https://apps.apple.com/gb/app/ddbx-uk/id6762196330) and [Android](https://play.google.com/store/apps/details?id=uk.ddbx.app) apps are the most polished way to use it, with real-time alerts when a director buys, the analysis as soon as it's ready, and more tools for tracking how trades perform over the long run.",
        ],
      },
      {
        title: "How",
        body: [
          "A Cloudflare Worker scrapes the official disclosure feeds, stores everything in D1 and runs each filing through two model passes: a quick screen that drops the routine ones, then a fuller analysis that scores the trade against a checklist.",
          "The same API serves the website, the UK and US apps on iPhone and Android. Each market is its own module on the data side, so a new country is a new module rather than a rewrite.",
        ],
      },
      {
        title: "Where",
        body: [
          "ddbx is there whenever you need it: on the [web](https://ddbx.uk), in the [iPhone](https://apps.apple.com/gb/app/ddbx-uk/id6762196330) and [Android](https://play.google.com/store/apps/details?id=uk.ddbx.app) apps, through the [API](https://ddbx.uk/api), over [MCP](https://ddbx.uk/mcp), and as a direct [connector in Claude](https://claude.ai/directory/ddbx?q=ddbx).",
        ],
      },
      {
        title: "Next",
        body: [
          "Taking Sweden and the Netherlands from preview to full markets, and adding more countries on the same pattern. The US has its own edition: [ddbx.us](https://ddbx.us).",
        ],
      },
    ],
    links: [
      { label: "ddbx.uk", href: "https://ddbx.uk" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=uk.ddbx.app" },
      { label: "API", href: "https://ddbx.uk/api" },
      { label: "MCP", href: "https://ddbx.uk/mcp" },
      { label: "Claude connector", href: "https://claude.ai/directory/ddbx?q=ddbx" },
    ],
    appStore: "https://apps.apple.com/gb/app/ddbx-uk/id6762196330",
    markets: [
      {
        code: "gb",
        name: "UK",
        web: { label: "ddbx.uk", href: "https://ddbx.uk" },
        ios: { label: "App Store", href: "https://apps.apple.com/gb/app/ddbx-uk/id6762196330" },
        android: { label: "Google Play", href: "https://play.google.com/store/apps/details?id=uk.ddbx.app" },
      },
      {
        code: "us",
        name: "US",
        web: { label: "ddbx.us", href: "https://ddbx.us" },
        ios: { label: "App Store", href: "https://apps.apple.com/us/app/ddbx-us/id6772091960" },
        android: { label: "Google Play", href: "https://play.google.com/store/apps/details?id=us.ddbx.app" },
      },
      { code: "se", name: "Sweden", web: { label: "Preview", href: "https://ddbx.uk/se" } },
      { code: "nl", name: "Netherlands", web: { label: "Preview", href: "https://ddbx.uk/nl" } },
    ],
    screens: {
      scheme: "dark",
      light: ["/screens/ddbx-deals.webp", "/screens/ddbx-performance.webp", "/screens/ddbx-company.webp"],
      captions: [
        "Today's director dealings, each one rated",
        "How the rated buys have done against the market",
        "A single dealing: the rating, the numbers and the checklist",
      ],
    },
  },
  {
    id: "ddbx-us",
    name: "ddbx.us",
    icon: "/icons/ddbx-us.jpg",
    accent: "#000000",
    scheme: "dark",
    tagline: "US insider and Congress trades, rated as they happen.",
    tags: ["iOS", "Web", "SEC Form 4", "STOCK Act"],
    body: [
      "The US edition: company insiders through their SEC Form 4 filings, and members of Congress through the trades the STOCK Act makes them disclose.",
    ],
    highlights: [
      "Congress feed: who bought what, and how it's done since",
      "Members ranked by how their trades have performed",
      "Insider buys rated from routine to significant",
      "Performance against the S&P 500 and Nasdaq",
    ],
    article: [
      {
        title: "What",
        body: [
          "[ddbx.us](https://ddbx.us) is the American edition of [ddbx](https://ddbx.uk). It reads two kinds of public filing. Company insiders (directors, officers and big shareholders) file a Form 4 with the SEC within two business days of trading their own company's stock. Members of Congress, and their spouses, report their stock trades under the STOCK Act, usually within 45 days.",
          "Insider buys go through the same checklist as the UK and get a rating from routine to significant. The Congress feed keeps to open-market buys of stocks and options, the trades you could actually follow, and leaves out sales, bonds and account reshuffles.",
        ],
      },
      {
        title: "Why",
        body: [
          "Members of Congress vote on the laws that move whole industries, so what they buy in their own accounts is worth a look. A buy reads stronger when the member sits on a committee that oversees the company, when several members move into the same stock at once, or when the size is too big to ignore, and those are the trades ddbx flags.",
          "The data has its quirks: amounts come as wide dollar bands rather than exact figures, and a filing can trail the trade by weeks. ddbx shows what's disclosed and no more.",
        ],
      },
      {
        title: "How",
        body: [
          "The US runs on the same platform as the UK: one Cloudflare Worker, one database, one API. Each market is its own module, so the US added a Form 4 reader and a Congress reader rather than a second product. The iPhone and Android apps are the same codebases too, built as separate US apps.",
        ],
      },
      {
        title: "Next",
        body: [
          "Following members and committees, and alerts when several members buy the same stock.",
        ],
      },
    ],
    links: [
      { label: "ddbx.us", href: "https://ddbx.us" },
      { label: "Congress", href: "https://ddbx.us/congress" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=us.ddbx.app" },
    ],
    appStore: "https://apps.apple.com/us/app/ddbx-us/id6772091960",
    compare: {
      title: "UK and US",
      intro: "One platform, two editions. Same idea, different rules.",
      columns: [
        { label: "ddbx.uk", code: "gb" },
        { label: "ddbx.us", code: "us" },
      ],
      rows: [
        { label: "Who", values: ["Directors and senior managers", "Company insiders and members of Congress"] },
        { label: "Filing", values: ["RNS announcement (UK MAR)", "SEC Form 4 and STOCK Act reports"] },
        { label: "Deadline", values: ["3 business days", "2 business days; Congress up to 45"] },
        { label: "Amounts", values: ["Exact", "Exact; Congress in dollar bands"] },
        { label: "Flagged by", values: ["Rating checklist", "Checklist; Congress on committee, cluster and size"] },
        { label: "Benchmark", values: ["FTSE All-Share, FTSE 100", "S&P 500, Nasdaq"] },
      ],
    },
    screens: {
      scheme: "dark",
      light: [
        "/screens/ddbx-us-directors.webp",
        "/screens/ddbx-us-congress.webp",
        "/screens/ddbx-us-trade.webp",
        "/screens/ddbx-us-performance.webp",
      ],
      captions: [
        "Today's insider buys at US companies, each one rated",
        "Members of Congress ranked by how their trades have done",
        "One trade, and the members of Congress who bought too",
        "How the flagged buys have done against the S&P 500",
      ],
    },
  },
  {
    id: "holdall",
    name: "Holdall",
    icon: "/icons/holdall.jpg",
    accent: "#ffffff",
    scheme: "light",
    tagline: "Where to work remotely next.",
    tags: ["iOS", "Android", "React Native"],
    body: ["Guides to 50+ places to work remotely: where to stay, where to work and where to get coffee."],
    highlights: [
      "50+ destination guides",
      "Coworking spaces and coffee shops on a map",
      "Costs, air quality and peak season at a glance",
    ],
    article: [
      {
        title: "What",
        body: [
          "[Holdall](https://www.holdall.work) reviews more than 50 destinations for remote working trips: the best areas to stay, coworking spaces, coffee shops and what to do in your free time.",
        ],
      },
      {
        title: "Why",
        body: [
          "I had always hated the idea of writing a travel blog. Plenty of people had suggested it, but I could never see myself doing it. Everything I had seen felt more like a thinly veiled vanity project than a true aid to someone planning a trip.",
          "Most guides aren't focused on remote work either, so I saw an opportunity to dive into it and reconceptualise the travel blog through product sense.",
        ],
      },
      {
        title: "How",
        body: [
          "The original site was built on [Webflow](https://webflow.com), with its CMS API powering a React Native app. Somewhat regrettably, I recently moved both the site and the mobile apps away from Webflow, to a fully native iOS app pulling from a database on D1.",
          "Why the change? For years, Webflow gave me a degree of freedom as a designer which was incredibly empowering. But in 2026 it no longer made sense as a platform. Manually refactoring all of the classes and custom CSS I had inserted felt increasingly archaic compared to what could be achieved with a standalone project.",
          "The migration was shockingly simple. I was anticipating a month-long process, and it was done in between dinner and falling asleep.",
        ],
      },
      {
        title: "Next",
        body: [
          "It's difficult to keep 50+ guides up to date, as they're all based on my personal experiences. Many of the earlier trips are now painfully out of date, especially those from the immediate post-covid era.",
          "I'm now viewing it as a time capsule, which I may periodically add to as a passion design project.",
        ],
      },
    ],
    // Snapshot of holdall.work/destinations, ranked by the average of its four ratings.
    destinations: {
      title: "Top destinations",
      intro: "The highest-rated places so far, scored for working, staying, value and fun.",
      items: [
        {
          name: "Bangkok",
          country: "Thailand",
          code: "th",
          url: "https://www.holdall.work/destinations/bangkok",
          scores: { work: 85, stay: 89, value: 89, fun: 91 },
        },
        {
          name: "Chiang Mai",
          country: "Thailand",
          code: "th",
          url: "https://www.holdall.work/destinations/chiang-mai",
          scores: { work: 92, stay: 94, value: 96, fun: 68 },
        },
        {
          name: "São Paulo",
          country: "Brazil",
          code: "br",
          url: "https://www.holdall.work/destinations/sao-paulo",
          scores: { work: 95, stay: 85, value: 87, fun: 78 },
        },
        {
          name: "Lima",
          country: "Peru",
          code: "pe",
          url: "https://www.holdall.work/destinations/lima",
          scores: { work: 82, stay: 86, value: 92, fun: 84 },
        },
        {
          name: "Cape Town",
          country: "South Africa",
          code: "za",
          url: "https://www.holdall.work/destinations/cape-town",
          scores: { work: 92, stay: 85, value: 83, fun: 84 },
        },
        {
          name: "Bogotá",
          country: "Colombia",
          code: "co",
          url: "https://www.holdall.work/destinations/bogota",
          scores: { work: 85, stay: 86, value: 88, fun: 78 },
        },
        {
          name: "Ho Chi Minh",
          country: "Vietnam",
          code: "vn",
          url: "https://www.holdall.work/destinations/ho-chi-minh",
          scores: { work: 78, stay: 88, value: 84, fun: 85 },
        },
        {
          name: "Buenos Aires",
          country: "Argentina",
          code: "ar",
          url: "https://www.holdall.work/destinations/buenos-aires",
          scores: { work: 86, stay: 87, value: 75, fun: 86 },
        },
      ],
    },
    screens: {
      scheme: "light",
      light: [
        "/screens/holdall-map.webp",
        "/screens/holdall-explore.webp",
        "/screens/holdall-guide.webp",
        "/screens/holdall-coworking.webp",
        "/screens/holdall-photos.webp",
      ],
      captions: [
        "Every destination on one map",
        "The latest guides, written from the road",
        "Ratings, costs and a verdict for every city",
        "Where to stay, work and get coffee",
        "Photos from every place, full screen",
      ],
    },
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
      "Every GA4 property on one screen, with live users and a fair day-on-day trend. It runs on the device, with no backend.",
      "It's currently pending release. Give me a shout if you'd like TestFlight access.",
    ],
    comingSoon: "GA Bridge is pending release on the App Store. Leave your email and I'll be in touch about TestFlight access.",
    highlights: [
      "Live users from the last 30 minutes",
      "Fair day-on-day trend, hour for hour",
      "No server, no tracking",
    ],
    article: [
      {
        title: "What",
        body: [
          "A small tool that collates all of your Google Analytics 4 properties into one dashboard.",
        ],
      },
      {
        title: "Why",
        body: [
          "One of the by-products of this year of aggressive building was an inevitable slew of GA tags. One of the most enjoyable aspects I've found is checking who is actually on your sites: what pages are popular, what's working and what's not. The official Google Analytics app fails miserably to do that at a glance if you have more than one site.",
        ],
      },
      {
        title: "How",
        body: [
          "A SwiftUI app that calls Google's Analytics Admin and Data APIs directly with a read-only sign-in. There's no server: the numbers are fetched on the phone.",
          "The trend compares the completed hours of today with the same hours yesterday, so a morning check isn't measured against a whole day.",
        ],
      },
      {
        title: "Next",
        body: ["It's currently pending release. Give me a shout if you'd like TestFlight access."],
      },
    ],
    links: [{ label: "gabridge.app", href: "https://gabridge.app" }],
    screens: {
      scheme: "dark",
      light: ["/screens/gabridge-home.webp", "/screens/gabridge-detail.webp", "/screens/gabridge-breakdown.webp"],
      captions: [
        "Every property on one screen, with a fair trend",
        "One property: live users and today against a typical day",
        "Countries, devices, sources and top pages",
      ],
    },
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
    body: ["Every speciality coffee shop in Istanbul on one map, with opening hours and directions."],
    highlights: ["The whole city, from Kadıköy to Karaköy", "Our Picks for each area", "Filter by roaster or origin"],
    article: [
      {
        title: "What",
        body: [
          "[Istanbrew](https://istanbrew.com) is a guide to the best speciality coffee in Istanbul. Every shop is on one map, with opening hours, directions and who roasts the beans, plus recommendations for each neighbourhood from Bakırköy to Maltepe.",
        ],
      },
      {
        title: "Why",
        body: [
          "Google Maps only goes so far when it comes to getting the details you truly need. The issue isn't exclusive to coffee, but it's the area I feel most passionate about, and a key activity when I arrive in a new city.",
          "Google Maps' strength comes from its breadth, but that's also its weakness. Finding exactly what you want in a city the size and scale of Istanbul can become a daunting task.",
          "What brew methods do they have? Do they have any anaerobically processed lots from Ethiopia in stock? Is this somewhere I can work from?",
          "By connecting shops, roasters and coffee connoisseurs, Istanbrew aims to far surpass anything else on the market.",
        ],
      },
      {
        title: "How",
        body: [
          "Everything comes from one coffee database with its own CMS and API. A native SwiftUI app and a web edition both read from it, and the web codebase builds a separate site for each city, in English and Turkish.",
        ],
      },
      {
        title: "Next",
        body: [
          "Istanbrew is the first of a network. [London](https://filter.coffee), [Bangkok](https://bkkbrew.com), [Chiang Mai](https://cnxbrew.com) and [San Francisco](https://brewsf.com) already have their own maps from the same database, with more cities to come.",
        ],
      },
    ],
    links: [{ label: "istanbrew.com", href: "https://istanbrew.com" }],
    follow: { label: "Follow on Instagram", href: "https://www.instagram.com/istanbrew/" },
    appStore: "https://apps.apple.com/gb/app/istanbrew/id6814183189",
    network: {
      title: "The coffee map network",
      intro: "The first of a network of the best coffee maps in the world, one city at a time.",
      sites: [
        {
          name: "Istanbrew",
          city: "Istanbul",
          url: "https://istanbrew.com",
          icon: "/icons/network/istanbul.png",
          cityId: "a3ueoba5n0xy0sru1hpw1xr3",
          appStore: "https://apps.apple.com/gb/app/istanbrew/id6814183189",
        },
        {
          name: "filter",
          city: "London",
          url: "https://filter.coffee",
          icon: "/icons/network/london.png",
          cityId: "yb04fbpj59rrsos7asq4fzxq",
        },
        {
          name: "bkkbrew",
          city: "Bangkok",
          url: "https://bkkbrew.com",
          icon: "/icons/network/bangkok.png",
          cityId: "tw0yqn6e8vujnxeb4yje6nwz",
        },
        {
          name: "cnxbrew",
          city: "Chiang Mai",
          url: "https://cnxbrew.com",
          icon: "/icons/network/chiang-mai.png",
          cityId: "x0m7lj2wwjcyxlhtckysd641",
        },
        {
          name: "brewSF",
          city: "San Francisco",
          url: "https://brewsf.com",
          icon: "/icons/network/san-francisco.png",
          cityId: "j562b54i8pp6y1l03wpaxol1",
        },
      ],
    },
    screens: {
      scheme: "light",
      light: [
        "/screens/istanbrew-welcome.webp",
        "/screens/istanbrew-map.webp",
        "/screens/istanbrew-areas.webp",
        "/screens/istanbrew-shop.webp",
      ],
      captions: [
        "Start with the city's best roasters and cafés",
        "Every shop on one map, clustered by area",
        "Neighbourhoods on both sides of the Bosphorus",
        "A shop's page: hours, roaster and the story behind it",
      ],
    },
  },
];

/** The interests widget is built but hidden for now. Flip to bring it back. */
export const SHOW_INTERESTS = false;

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

export const ALL_ENTRIES: AppEntry[] = [ABOUT, ...(SHOW_INTERESTS ? [INTERESTS] : []), ...APPS];
