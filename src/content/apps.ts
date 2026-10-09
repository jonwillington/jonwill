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
  /** The app's App Store page: shows Apple's "Download on the App Store" badge. */
  appStore?: string;
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
  /** Where the app is available, by market and platform. */
  markets?: Market[];
  /**
   * The long read in the "Learn more" drawer: titled sections, in the same
   * order for every app (What is it? / Why I made it / How I built it / What's next).
   */
  article?: { title: string; body: string[] }[];
  /** A side-by-side of two related products: what differs and what's shared. */
  compare?: {
    title: string;
    intro: string;
    columns: [{ label: string; code: Market["code"] }, { label: string; code: Market["code"] }];
    rows: { label: string; values: [string, string] }[];
    /** Rows that are the same for both, shown once across both columns. */
    shared: { label: string; value: string }[];
  };
  /** Top-rated places, highest overall first. */
  destinations?: { title: string; intro: string; items: Destination[] };
  /** A wider family of sites this app belongs to. */
  network?: { title: string; intro: string; sites: NetworkSite[] };
};

export const ABOUT: AppEntry = {
  id: "about",
  name: "Jon",
  title: "Welcome!",
  icon: "/me.jpg",
  accent: "#cfcbd7",
  scheme: "light",
  tagline: "I'm Jon. Make yourself at home.",
  tags: ["Design leadership", "Product design", "Side projects"],
  body: [
    "I'm a Group Product Design Manager at Deel, living in Istanbul. Outside work I design and build my own apps, end to end. They're all on this phone: tap one to see it running.",
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
      "Ratings from routine to significant",
      "Performance tracking against benchmarks",
    ],
    article: [
      {
        title: "What is it?",
        body: [
          "ddbx follows what company directors do with their own money. When a director buys or sells shares in their company, they have to say so publicly. ddbx picks up those filings within minutes, screens out the routine ones and rates the rest from minor to significant, with a written analysis of why.",
          "This is the UK edition, built on the RNS announcements directors and senior managers (PDMRs) have to make. It tracks how each deal performs against the FTSE afterwards, and Sweden and the Netherlands run on the same platform in preview.",
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
          "Shipping the Android app to the Play Store, taking Sweden and the Netherlands from preview to full markets, and adding more countries on the same pattern. The US has its own edition: ddbx.us.",
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
        title: "What is it?",
        body: [
          "ddbx.us is the American edition of ddbx. It reads two kinds of public filing. Company insiders (directors, officers and big shareholders) file a Form 4 with the SEC within two business days of trading their own company's stock. Members of Congress, and their spouses, report their stock trades under the STOCK Act, usually within 45 days.",
          "Insider buys go through the same checklist as the UK and get a rating from routine to significant. The Congress feed keeps to open-market buys of stocks and options, the trades you could actually follow, and leaves out sales, bonds and account reshuffles.",
        ],
      },
      {
        title: "Why Congress",
        body: [
          "Members of Congress vote on the laws that move whole industries, so what they buy in their own accounts is worth a look. A buy reads stronger when the member sits on a committee that oversees the company, when several members move into the same stock at once, or when the size is too big to ignore, and those are the trades ddbx flags.",
          "The data has its quirks: amounts come as wide dollar bands rather than exact figures, and a filing can trail the trade by weeks. ddbx shows what's disclosed and no more.",
        ],
      },
      {
        title: "How I built it",
        body: [
          "The US runs on the same platform as the UK: one Cloudflare Worker, one database, one API. Each market is its own module, so the US added a Form 4 reader and a Congress reader rather than a second product. The iOS app is the same codebase too, built as a separate US app.",
        ],
      },
      {
        title: "What's next",
        body: [
          "Following members and committees, alerts when several members buy the same stock, and an Android release alongside the UK one.",
        ],
      },
    ],
    links: [
      { label: "ddbx.us", href: "https://ddbx.us" },
      { label: "Congress", href: "https://ddbx.us/congress" },
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
      shared: [
        { label: "Platform", value: "One Worker, database and API" },
        { label: "Ratings", value: "Routine to significant, with a written analysis" },
        { label: "Apps", value: "One iOS codebase, two App Store apps" },
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
    links: [{ label: "istanbrew.com", href: "https://istanbrew.com" }],
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
