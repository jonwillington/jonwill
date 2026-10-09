import { useEffect } from "react";

import { ABOUT, ALL_ENTRIES, APPS, type AppEntry } from "../content/apps";
import { SITE } from "../content/site";
import { asset } from "../lib/asset";
import { IconArt } from "../components/AppIcon";
import { ContactCard } from "../components/phone/ContactCard";
import { Splash } from "../components/phone/Splash";
import { DEVICE, SCREEN } from "../components/phone/constants";

const W = 1200;
const H = 630;
/** The phone fills most of the card's height, sitting off the left edge a little. */
const PHONE_H = 560;
const K = PHONE_H / DEVICE.height;

/**
 * A link-preview card (1200×630) for one page: the phone showing it, and its name and
 * line beside it. "default" (and "about") is the site as a whole. Rendered at ?og=<id>
 * and captured by scripts/render-og.mjs into /public/og.
 */
export function OgCard({ id }: { id: string }) {
  const entry = ALL_ENTRIES.find((e) => e.id === id && e.id !== "about") ?? null;
  const site = !entry;
  const light = site ? true : entry.scheme === "light";

  // Tells the capture script the card's fonts and images are in.
  useEffect(() => {
    const images = [...document.images].map((img) =>
      img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener("load", r, { once: true })),
    );
    Promise.all([document.fonts.ready, ...images]).then(() => document.body.setAttribute("data-og-ready", ""));
    // And which cards there are to capture.
    document.body.dataset.ogIds = ALL_ENTRIES.map((e) => e.id).join(" ");
  }, []);

  return (
    <div
      data-night="false"
      className={`relative flex overflow-hidden ${light ? "text-neutral-900" : "text-white"}`}
      style={{ width: W, height: H, background: site ? ABOUT.accent : entry.accent }}
    >
      {/* A soft light behind the phone, as on the site. */}
      <div
        className="absolute -left-40 top-1/2 size-[760px] -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: light ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.10)" }}
      />

      <div className="relative shrink-0" style={{ width: DEVICE.width * K, height: PHONE_H, margin: `${(H - PHONE_H) / 2}px 0 0 96px` }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: DEVICE.width, height: DEVICE.height, transform: `scale(${K})` }}>
          <div
            className="absolute overflow-hidden"
            style={{ left: SCREEN.left, top: SCREEN.top, width: SCREEN.width, height: SCREEN.height, borderRadius: SCREEN.radius, background: site ? "#000" : entry.accent }}
          >
            <Screen entry={entry} />
          </div>
          <img src={asset("/device/iphone-17-black.png")} alt="" className="absolute inset-0 size-full" />
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col justify-center pl-16 pr-20">
        {site ? (
          <>
            <h1 className="text-[76px] font-medium leading-[1] tracking-[-0.035em]">{SITE.name}</h1>
            <p className="mt-5 text-[30px] leading-[1.25] opacity-70">
              {SITE.role}, {SITE.company.name}
            </p>
            <div className="mt-10 flex gap-4">
              {APPS.slice(0, 6).map((app) => (
                <span key={app.id} className="size-[64px] [filter:drop-shadow(0_4px_10px_rgba(0,0,0,0.15))]">
                  <IconArt entry={app} size={64} />
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="mb-7 size-[84px] [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.18))]">
              <IconArt entry={entry} size={84} />
            </span>
            <h1 className="text-[76px] font-medium leading-[1] tracking-[-0.035em]">{entry.title ?? entry.name}</h1>
            {entry.tagline && <p className="mt-5 text-[32px] leading-[1.25] opacity-70">{entry.tagline}</p>}
          </>
        )}
        <p className="absolute bottom-12 left-16 text-[22px] font-medium opacity-55">
          {site ? SITE.domain : `${SITE.domain}  ·  ${SITE.name}`}
        </p>
      </div>
    </div>
  );
}

/** What's on the phone: the contact card for the site, an app's first screen, or its splash. */
function Screen({ entry }: { entry: AppEntry | null }) {
  if (!entry) return <ContactCard onBack={() => {}} />;
  const first = entry.screens?.light.find((s) => !s.endsWith(".mp4"));
  if (first) return <img src={asset(first)} alt="" className="size-full object-cover" />;
  return <Splash entry={entry} />;
}
