// The mini CMS. One entry per icon on the home screen, in grid order.
// Edit copy, links and facts here; the phone and the detail panel read
// straight from this list. Icons live in /public/icons.

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

/** A sister site in a network, e.g. the other city coffee maps. */
/** `cityId` is the Filter API city, for live shop and roaster counts. */
export type NetworkSite = { name: string; city: string; url: string; icon: string; cityId?: string };

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
  /**
   * Real screenshots (804×1748, in /public/screens) shown inside the phone
   * when the app opens, in order. `scheme` is the screens' own look, which
   * sets the home indicator; `dark` swaps in for dark mode where it exists.
   */
  screens?: { scheme: "light" | "dark"; light: string[]; dark?: string[] };
  /** Where the app is available, by market and platform. */
  markets?: Market[];
  /**
   * The long read in the "Learn more" drawer: titled sections, in the same
   * order for every app (What is it? / Why I made it / How I built it / What's next).
   */
  article?: { title: string; body: string[] }[];
  /** A wider family of sites this app belongs to. */
  network?: { title: string; intro: string; sites: NetworkSite[] };
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
    "Group Product Design Manager at Deel, based in Istanbul. Outside work I design and build my own apps, end to end.",
  ],
  article: [
    {
      title: "Who I am",
      body: ["I'm Jon, a Group Product Design Manager at Deel, currently living in Istanbul."],
    },
    {
      title: "What I do",
      body: [
        "At Deel I lead product design teams. Outside work I design and build my own apps from end to end: the product thinking, the design, the code and the data behind it.",
      ],
    },
    {
      title: "On this phone",
      body: [
        "The apps here are the ones I've been working on. Each one has a page like this one: what it is, why I made it, how it's built and where it's going.",
      ],
    },
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
    body: ["Global HR and payroll for companies hiring anywhere. I lead product design teams there."],
    article: [
      {
        title: "What is it?",
        body: [
          "Deel is a global HR and payroll platform. It helps companies hire, pay and manage people anywhere in the world, with contractors and employees in one place.",
        ],
      },
      {
        title: "My role",
        body: ["I'm a Group Product Design Manager, leading design teams working across the product."],
      },
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
    tags: ["iOS", "Web", "Android", "Cloudflare"],
    body: ["Tracks director share dealings as they are filed and rates each one, from routine to significant."],
    highlights: [
      "Live push alerts for new filings",
      "Ratings from routine to significant",
      "Performance tracking against benchmarks",
    ],
    article: [
      {
        title: "What is it?",
        body: [
          "ddbx follows what company directors do with their own money. When a director buys or sells shares in their company, they have to say so publicly. ddbx picks up those filings within minutes, screens out the routine ones and rates the rest from minor to significant, with a written analysis of why.",
          "It covers UK and US listed companies, with Sweden and the Netherlands on the data side, and tracks how each deal performs against the market afterwards.",
        ],
      },
      {
        title: "Why I made it",
        body: [
          "Director dealings are public, but they're scattered across regulatory feeds and hard to read at a glance. I wanted one place that says which filings are worth a second look, and shows afterwards whether the insiders were right.",
        ],
      },
      {
        title: "How I built it",
        body: [
          "A Cloudflare Worker scrapes the official disclosure feeds, stores everything in D1 and runs each filing through two model passes: a quick screen that drops the routine ones, then a fuller analysis that scores the trade against a checklist.",
          "The same API serves the website, the UK and US iOS apps and an Android port. Each market is its own module on the data side, so a new country is a new module rather than a rewrite.",
        ],
      },
      {
        title: "What's next",
        body: [
          "Shipping the Android app to the Play Store, taking Sweden and the Netherlands from preview to full markets, and adding more countries on the same pattern.",
        ],
      },
    ],
    links: [{ label: "ddbx.uk", href: "https://ddbx.uk" }],
    markets: [
      {
        code: "gb",
        name: "UK",
        web: { label: "ddbx.uk", href: "https://ddbx.uk" },
        ios: { label: "App Store", href: "https://apps.apple.com/gb/app/ddbx-uk/id6762196330" },
        android: { label: "In progress" },
      },
      {
        code: "us",
        name: "US",
        web: { label: "ddbx.us", href: "https://ddbx.us" },
        ios: { label: "App Store", href: "https://apps.apple.com/us/app/ddbx-us/id6772091960" },
        android: { label: "Testing" },
      },
      { code: "se", name: "Sweden", web: { label: "Preview", href: "https://ddbx.uk/se" } },
      { code: "nl", name: "Netherlands", web: { label: "Preview", href: "https://ddbx.uk/nl" } },
    ],
    screens: {
      scheme: "dark",
      light: ["/screens/ddbx-deals.webp", "/screens/ddbx-performance.webp", "/screens/ddbx-company.webp"],
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
        title: "What is it?",
        body: [
          "Holdall reviews more than 50 destinations for remote working trips: the best areas to stay, coworking spaces, coffee shops and what to do in your free time.",
        ],
      },
      {
        title: "Why I made it",
        body: [
          "Planning a remote working trip means piecing together where to stay, where to work and what a place costs from a dozen sources. Holdall puts that research into one guide per destination.",
        ],
      },
      {
        title: "How I built it",
        body: [
          "A React Native app built with Expo. The guides are written in a CMS, maps come from Google and Mapbox, and each destination pulls in data such as air quality, cost of living and peak season.",
        ],
      },
      {
        title: "What's next",
        body: ["More destinations, and keeping the existing guides current."],
      },
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
      "Every GA4 property on one screen, with live users and a fair day-on-day trend. It runs on the device, with no backend.",
    ],
    highlights: [
      "Live users from the last 30 minutes",
      "Fair day-on-day trend, hour for hour",
      "No server, no tracking",
    ],
    article: [
      {
        title: "What is it?",
        body: [
          "GA Bridge puts every Google Analytics 4 property you have on one screen: live users, today's users and page views, and a trend against yesterday. Tap a property for its top pages and a seven-day chart.",
        ],
      },
      {
        title: "Why I made it",
        body: [
          "Checking several sites in Google Analytics means clicking through property after property. I wanted them all in one glance, with a trend that's fair to compare at any time of day.",
        ],
      },
      {
        title: "How I built it",
        body: [
          "A SwiftUI app that calls Google's Analytics Admin and Data APIs directly with a read-only sign-in. There's no server: the numbers are fetched on the phone.",
          "The trend compares the completed hours of today with the same hours yesterday, so a morning check isn't measured against a whole day.",
        ],
      },
      {
        title: "What's next",
        body: ["Google's verification for the read-only analytics scope, then a public release on the App Store."],
      },
    ],
    links: [{ label: "gabridge.app", href: "https://gabridge.app" }],
    screens: {
      scheme: "light",
      light: ["/screens/gabridge-home.webp", "/screens/gabridge-detail.webp"],
      dark: ["/screens/gabridge-home-dark.webp", "/screens/gabridge-detail-dark.webp"],
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
        title: "What is it?",
        body: [
          "Istanbrew is a guide to the best speciality coffee in Istanbul. Every shop is on one map, with opening hours, directions and who roasts the beans, and each area has a top pick to start with.",
        ],
      },
      {
        title: "Why I made it",
        body: [
          "Istanbul's coffee scene is big and spread across two continents, and good shops are easy to miss. I wanted a map I'd trust myself, built from places that have been checked rather than scraped.",
        ],
      },
      {
        title: "How I built it",
        body: [
          "Everything comes from one coffee database with its own CMS and API. A native SwiftUI app and a web edition both read from it, and the web codebase builds a separate site for each city, in English and Turkish.",
        ],
      },
      {
        title: "What's next",
        body: [
          "Istanbrew is the first of a network. London, Bangkok, Chiang Mai and San Francisco already have their own maps from the same database, with more cities to come.",
        ],
      },
    ],
    links: [
      { label: "istanbrew.com", href: "https://istanbrew.com" },
      { label: "App Store", href: "https://apps.apple.com/gb/app/istanbrew/id6814183189" },
    ],
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
