// GET /api/live — a small, cached digest of live data for the home-screen
// widgets and lock-screen notifications. Runs as a Cloudflare Pages Function
// so the browser never calls the upstream APIs directly (ddbx sends no CORS
// headers, and Istanbrew's catalog is far bigger than we need).

type Rating = "significant" | "noteworthy" | "minor" | "routine";

type Dealing = {
  id: string;
  created_at: string;
  company: string;
  ticker: string | null;
  tx_type: string;
  value_gbp: number | null;
  director: { name: string; role: string };
  analysis?: { rating?: Rating; summary?: string } | null;
};

type Shop = {
  id: string;
  name: string;
  prefName: string | null;
  qualityTier: string | null;
  googleRating: { stars: number; reviewCount: number } | null;
  heroImage: { formats?: Record<string, { url: string }> } | null;
  openingHours: {
    days: { weekday: number; status: string; ranges: { open: string; close: string }[] }[];
  } | null;
};

export type Live = {
  ddbx: {
    id: string;
    url: string;
    company: string;
    ticker: string | null;
    role: string;
    valueGbp: number | null;
    rating: Rating;
    summary: string | null;
    at: string;
  } | null;
  istanbrew: {
    openNow: number;
    total: number;
    pick: { name: string; area: string | null; image: string | null; url: string } | null;
  } | null;
  /** Shop and roaster counts for each city in the coffee map network, keyed by city id. */
  network: Record<string, { shops: number; roasters: number }>;
  generatedAt: string;
};

// The coffee map network (filter-city-web/cities): Istanbul, London, Bangkok, Chiang Mai, San Francisco.
const NETWORK_CITIES = [
  "a3ueoba5n0xy0sru1hpw1xr3",
  "yb04fbpj59rrsos7asq4fzxq",
  "tw0yqn6e8vujnxeb4yje6nwz",
  "x0m7lj2wwjcyxlhtckysd641",
  "j562b54i8pp6y1l03wpaxol1",
];

const ISTANBUL_CITY = "a3ueoba5n0xy0sru1hpw1xr3";
const CACHE_SECONDS = 300;

export const onRequestGet: PagesFunction = async (context) => {
  const cache = caches.default;
  const key = new Request(new URL("/api/live", context.request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const catalogs = new Map(
    await Promise.all(NETWORK_CITIES.map(async (id) => [id, await catalog(id).catch(() => null)] as const)),
  );
  const [ddbx] = await Promise.all([latestDealing().catch(() => null)]);
  const istanbul = catalogs.get(ISTANBUL_CITY);
  const body: Live = {
    ddbx,
    istanbrew: istanbul ? openShops(istanbul) : null,
    network: Object.fromEntries(
      [...catalogs].flatMap(([id, c]) =>
        c ? [[id, { shops: c.shops.length, roasters: c.brands.filter((b) => b.roastsOwnBeans).length }]] : [],
      ),
    ),
    generatedAt: new Date().toISOString(),
  };

  const res = new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${CACHE_SECONDS}`,
    },
  });
  context.waitUntil(cache.put(key, res.clone()));
  return res;
};

/** The newest buy rated significant, falling back to noteworthy. */
async function latestDealing(): Promise<Live["ddbx"]> {
  const res = await fetch("https://api.ddbx.uk/api/dealings", { cf: { cacheTtl: CACHE_SECONDS } });
  if (!res.ok) return null;
  const { dealings } = (await res.json()) as { dealings: Dealing[] };
  const buys = dealings
    .filter((d) => d.tx_type === "buy" && d.analysis?.rating)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const d =
    buys.find((x) => x.analysis?.rating === "significant") ?? buys.find((x) => x.analysis?.rating === "noteworthy");
  if (!d) return null;
  return {
    id: d.id,
    url: `https://ddbx.uk/dealings/${d.id}`,
    company: d.company.replace(/(\s*\([^)]*\))+\s*$/, ""),
    ticker: d.ticker,
    role: d.director.role,
    valueGbp: d.value_gbp,
    rating: d.analysis!.rating!,
    summary: d.analysis?.summary ?? null,
    at: d.created_at.replace(" ", "T") + "Z",
  };
}

type Catalog = { shops: Shop[]; brands: { roastsOwnBeans: boolean | null }[] };

async function catalog(cityId: string): Promise<Catalog | null> {
  const res = await fetch(`https://api.filter.coffee/v3/cities/${cityId}/catalog`, { cf: { cacheTtl: CACHE_SECONDS } });
  if (!res.ok) return null;
  return ((await res.json()) as { data: Catalog }).data;
}

/** How many of the shops the site lists are open right now, and a well-rated one to show. */
function openShops({ shops }: Catalog): Live["istanbrew"] {
  const now = istanbulClock();
  const open = shops.filter((s) => isOpen(s, now));

  // Rotate through the top few each hour so returning visitors see a different shop.
  const ranked = [...open].sort((a, b) => score(b) - score(a)).slice(0, 6);
  const pick = ranked.length ? ranked[Math.floor(Date.now() / 3_600_000) % ranked.length] : null;

  return {
    openNow: open.length,
    total: shops.length,
    pick: pick && {
      name: pick.name,
      area: pick.prefName,
      image: pick.heroImage?.formats?.small?.url ?? pick.heroImage?.formats?.thumbnail?.url ?? null,
      url: `https://istanbrew.com/x?k=shops&id=${encodeURIComponent(pick.id)}`,
    },
  };
}

const score = (s: Shop) => (s.googleRating ? s.googleRating.stars * Math.log10(10 + s.googleRating.reviewCount) : 0);

/** ISO weekday (1 = Monday) and minutes since midnight in Istanbul. */
function istanbulClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday")) + 1;
  return { weekday, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function isOpen(shop: Shop, { weekday, minutes }: { weekday: number; minutes: number }) {
  const days = shop.openingHours?.days;
  if (!days) return false;
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const yesterday = weekday === 1 ? 7 : weekday - 1;
  for (const day of days) {
    if (day.status !== "open") continue;
    for (const { open, close } of day.ranges) {
      const o = toMin(open);
      const c = toMin(close);
      if (day.weekday === weekday && (c > o ? minutes >= o && minutes < c : minutes >= o)) return true;
      // A range that runs past midnight is still open early the next day.
      if (day.weekday === yesterday && c <= o && minutes < c) return true;
    }
  }
  return false;
}
