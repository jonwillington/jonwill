import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Chip, buttonVariants } from "@heroui/react";

import type { AppEntry, Destination, Market, MarketCell, NetworkSite } from "../content/apps";
import type { Live } from "../lib/live";
import { IconArt } from "./AppIcon";
import { CloseX } from "./CloseX";
import { Rich } from "../lib/rich";
import { ComingSoonButton } from "./ComingSoon";
import { entryName } from "../content/site";
import { asset } from "../lib/asset";

// Items only fade in: the panel itself slides, and a second vertical drift on each
// item read as the text still moving after the panel had arrived.
const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35 } },
};

/** The panel's call-to-action buttons: tall, easy to hit. */
export const BIG_BUTTON =
  "h-12 gap-2 px-6 text-[16px] font-medium transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:translate-x-0.5";
/** Our own tints, with hover states: HeroUI's colour classes are replaced, so its hovers go too. */
const PRIMARY = "bg-foreground text-background hover:bg-foreground/85 hover:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)]";
export const SECONDARY = "bg-foreground/10 text-foreground hover:bg-foreground/[0.16]";

/** Small uppercase label above a section, in the same mono as the chips. */
export const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55";

/** The summary beside the phone: who or what, in a few lines, with a way into the details. */
export function DetailContent({
  entry,
  live,
  onClose,
  onLearnMore,
  showClose = true,
  gallery,
}: {
  entry: AppEntry;
  live?: Live | null;
  onClose: () => void;
  onLearnMore: () => void;
  /** On desktop the page's top-right close does this job, so the panel hides its own. */
  showClose?: boolean;
  /** Phones: the app's screens, under the name, since there's no phone mockup beside it. */
  gallery?: ReactNode;
}) {
  const hasData = !!(entry.markets || entry.network || entry.destinations || entry.compare);
  // The hiring card is narrower than the data blocks, so it gets its column sooner (xl, not 2xl),
  // and the text beside it never hides.
  const hiring = !hasData && !!entry.hiring;
  const left = hiring ? "xl:col-start-1" : "2xl:col-start-1";
  const right = hiring
    ? "xl:col-start-2 xl:row-span-5 xl:row-start-1"
    : "2xl:col-start-2 2xl:row-span-5 2xl:row-start-1";
  return (
    <motion.div
      key={entry.id}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.05, delayChildren: 0.08 }}
      // Wide screens: summary on the left, the data block taking the right column.
      className={`flex flex-col gap-5 text-[15px] leading-[1.6] ${
        hasData
          ? "2xl:grid 2xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] 2xl:content-start 2xl:gap-x-12"
          : hiring
            ? "xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] xl:content-start xl:gap-x-10"
            : ""
      }`}
    >
      {/* Desktop: a big title (the phone already shows the icon). Phones: icon, then the name. */}
      <motion.div variants={item} className={`flex items-start justify-between ${left}`}>
        <div>
          {showClose && (
            <div className="mb-4 size-16 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.10))]">
              <IconArt entry={entry} size={64} round={entry.id === "about"} />
            </div>
          )}
          <h2
            className={`font-medium leading-[1.05] tracking-[-0.03em] ${showClose ? "text-[26px]" : "text-[44px] 2xl:text-[52px]"}`}
          >
            {entry.title ?? entryName(entry)}
          </h2>
          {entry.tagline && (
            <p className={`text-foreground/65 ${showClose ? "mt-0.5" : "mt-2 text-[17px]"}`}>{entry.tagline}</p>
          )}
        </div>
        {showClose && <CloseX onPress={onClose} />}
      </motion.div>

      {entry.tags.length > 0 && (
        <motion.div variants={item} className={left}>
          <Tags tags={entry.tags} />
        </motion.div>
      )}

      {gallery && (
        <motion.div variants={item} className={left}>
          {gallery}
        </motion.div>
      )}

      {/* The rich data stays on the page; the longer story lives in the drawer. */}
      {entry.markets && (
        <motion.div variants={item} className={right}>
          <MarketGrid markets={entry.markets} />
        </motion.div>
      )}
      {entry.network && (
        <motion.div variants={item} className={right}>
          <Network {...entry.network} counts={live?.network} />
        </motion.div>
      )}
      {entry.destinations && (
        <motion.div variants={item} className={right}>
          <Destinations {...entry.destinations} />
        </motion.div>
      )}
      {entry.compare && (
        <motion.div variants={item} className={right}>
          <Compare {...entry.compare} />
        </motion.div>
      )}
      {/* The description: always when there's no data; beside it on wide screens. */}
      <motion.div variants={item} className={`space-y-3 text-foreground/80 ${left} ${hasData ? "hidden 2xl:block" : ""}`}>
        {entry.body.map((p, i) => (
          <p key={i}>
            <Rich text={p} />
          </p>
        ))}
      </motion.div>

      {/* Pages with a hiring card leave the link buttons off: the card has its own way in. */}
      {!entry.hiring && (
        <motion.div variants={item} className={`flex flex-wrap items-center gap-2 ${left}`}>
          {entry.links[0] && <LinkButton link={entry.links[0]} primary />}
          {entry.comingSoon && <ComingSoonButton entry={entry} />}
          {entry.follow && <LinkButton link={entry.follow} />}
          {/* No longer story to tell: the rest of the links take the drawer's place. */}
          {entry.article ? (
            <button
              type="button"
              onClick={onLearnMore}
              className={buttonVariants({ size: "lg", className: `${BIG_BUTTON} ${SECONDARY}` })}
            >
              Learn more
              <svg
                width="15"
                height="15"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M4.5 3 7.5 6l-3 3" />
              </svg>
            </button>
          ) : (
            entry.links.slice(1).map((link) => <LinkButton key={link.href} link={link} />)
          )}
        </motion.div>
      )}
      {entry.hiring && (
        <motion.div variants={item} className={right}>
          <Hiring {...entry.hiring} />
        </motion.div>
      )}
    </motion.div>
  );
}

/** "We're hiring": a short pitch, the facts at a glance, and the way in. */
function Hiring({ title, intro, facts, outro, cta }: NonNullable<AppEntry["hiring"]>) {
  return (
    <section aria-label={title} data-track="hiring" className="rounded-[18px] bg-foreground/[0.06] p-5">
      <p className={`mb-2 flex items-center gap-2 ${EYEBROW}`}>
        <span className="text-foreground/75" aria-hidden>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5v3.6l-1.7 2.9A1 1 0 0 0 4.7 17h14.6a1 1 0 0 0 .9-1.5l-1.7-2.9V9A6.5 6.5 0 0 0 12 2.5ZM9.5 18.5a2.5 2.5 0 0 0 5 0z" />
          </svg>
        </span>
        {title}
      </p>
      <p className="text-foreground/80">{intro}</p>
      <dl className="mt-4 divide-y divide-foreground/10 border-y border-foreground/10">
        {facts.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className={EYEBROW}>{f.label}</dt>
            <dd className="text-right font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-foreground/80">{outro}</p>
      <div className="mt-4">
        <LinkButton link={cta} primary />
      </div>
    </section>
  );
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Chip
          key={tag}
          size="sm"
          className="rounded-[5px] bg-foreground/[0.07] px-2 font-mono text-[11px] uppercase tracking-[0.06em] text-foreground/80"
        >
          {tag}
        </Chip>
      ))}
    </div>
  );
}

export function LinkButton({ link, primary = false }: { link: { label: string; href: string }; primary?: boolean }) {
  const external = link.href.startsWith("http");
  return (
    <a
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={buttonVariants({
        size: "lg",
        // Neutral tints so the buttons sit on any app's background.
        className: `group ${BIG_BUTTON} ${primary ? PRIMARY : SECONDARY}`,
      })}
    >
      {link.label}
      {external && (
        <span aria-hidden className="text-[17px] leading-none">
          ↗
        </span>
      )}
    </a>
  );
}

const PLATFORMS = [
  ["web", "Web"],
  ["ios", "iOS"],
  ["android", "Android"],
] as const;

/** Globe, Apple and Android marks for the grid header. */
function PlatformIcon({ platform }: { platform: (typeof PLATFORMS)[number][0] }) {
  if (platform === "web")
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
      </svg>
    );
  if (platform === "ios")
    return (
      <svg width="12" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5" />
    </svg>
  );
}

/** Markets down the side, platforms across the top; each cell links out or shows its status. */
export function MarketGrid({ markets }: { markets: Market[] }) {
  return (
    <section aria-label="Availability by market and platform" data-track="market_grid">
      <p className={`mb-2 ${EYEBROW}`}>Markets</p>
      <div className="overflow-hidden rounded-[10px] border border-foreground/10">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-foreground/[0.04]">
              <th scope="col" className={`px-3 py-2 ${EYEBROW}`}>
                Market
              </th>
              {PLATFORMS.map(([key, label]) => (
                <th key={label} scope="col" className={`px-3 py-2 ${EYEBROW}`}>
                  <span className="flex items-center gap-1.5">
                    <span className="text-foreground/70">
                      <PlatformIcon platform={key} />
                    </span>
                    {label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => (
              <tr key={m.code} className="border-t border-foreground/10">
                <th scope="row" className="px-3 py-2.5 font-medium">
                  <span className="flex items-center gap-2">
                    <Flag code={m.code} />
                    {m.name}
                  </span>
                </th>
                {PLATFORMS.map(([key]) => (
                  <td key={key} className="px-3 py-2.5">
                    <Cell cell={m[key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Cell({ cell }: { cell?: MarketCell }) {
  if (!cell) return <span className="text-foreground/25">–</span>;
  if (!cell.href) {
    return (
      <span className="rounded-[4px] bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.05em] text-foreground/60">
        {cell.label}
      </span>
    );
  }
  return (
    <a
      href={cell.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium underline decoration-foreground/25 underline-offset-[3px] hover:decoration-foreground"
    >
      {cell.label}
      <span aria-hidden className="text-foreground/50">
        ↗
      </span>
    </a>
  );
}

/** The other sites in the family, favicon first, current one marked. */
export function Network({
  title,
  intro,
  sites,
  counts,
}: {
  title: string;
  intro: string;
  sites: NetworkSite[];
  /** Live shop and roaster counts by Filter city id, when available. */
  counts?: Live["network"];
}) {
  return (
    <section aria-label={title} data-track="network">
      <p className={`mb-2 ${EYEBROW}`}>{title}</p>
      <p className="mb-3 text-foreground/75">{intro}</p>
      <ul className="overflow-hidden rounded-[10px] border border-foreground/10">
        {sites.map((s, i) => (
          <li
            key={s.url}
            className={`flex items-center gap-3 pr-3 transition-colors hover:bg-foreground/[0.04] ${i ? "border-t border-foreground/10" : ""} ${i === 0 ? "bg-foreground/[0.03]" : ""}`}
          >
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3 text-[13px]"
              aria-current={i === 0 ? "page" : undefined}
            >
              <img src={asset(s.icon)} alt="" className="size-7 rounded-[7px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.12)]" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{s.name}</span>
                <span className="block text-foreground/55">
                  {s.city}
                  {s.cityId && counts?.[s.cityId] && (
                    <span className="tabular-nums">
                      {" · "}
                      {counts[s.cityId].shops} shops · {counts[s.cityId].roasters} roasters
                    </span>
                  )}
                </span>
              </span>
              <span className="font-mono text-[12px] text-foreground/60 group-hover:text-foreground">
                {s.url.replace(/^https:\/\//, "")}
              </span>
              <NewTabArrow />
            </a>
            {/* A fixed slot, so URLs line up whether or not a city has an app yet. */}
            <span className="flex w-[84px] shrink-0 justify-end">
              {s.appStore && <AppStoreBadge href={s.appStore} size="sm" />}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Small, self-contained flags (emoji flags don't render on Windows). */
function Flag({ code }: { code: Market["code"] }) {
  const flags: Record<Market["code"], ReactNode> = {
    gb: (
      <>
        <rect width="60" height="40" fill="#012169" />
        <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
        <path d="M0 0 60 40M60 0 0 40" stroke="#C8102E" strokeWidth="3" />
        <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
        <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="7" />
      </>
    ),
    us: (
      <>
        <rect width="60" height="40" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((r) => (
          <rect key={r} y={(r * 40) / 13} width="60" height={40 / 13} fill="#B22234" />
        ))}
        <rect width="26" height={(40 / 13) * 7} fill="#3C3B6E" />
      </>
    ),
    se: (
      <>
        <rect width="60" height="40" fill="#006AA7" />
        <path d="M22 0v40M0 20h60" stroke="#FECC00" strokeWidth="8" />
      </>
    ),
    nl: (
      <>
        <rect width="60" height="40" fill="#21468B" />
        <rect width="60" height="26.7" fill="#fff" />
        <rect width="60" height="13.3" fill="#AE1C28" />
      </>
    ),
  };
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 60 40"
      preserveAspectRatio="none"
      className="shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]"
      aria-hidden
    >
      {flags[code]}
    </svg>
  );
}

const SCORES = [
  ["work", "Work"],
  ["stay", "Stay"],
  ["value", "Value"],
  ["fun", "Fun"],
] as const;

/** Ranked places with flags and their four scores; each row opens the write-up. */
function Destinations({ title, intro, items }: { title: string; intro: string; items: Destination[] }) {
  const overall = (d: Destination) => Math.round((d.scores.work + d.scores.stay + d.scores.value + d.scores.fun) / 4);
  return (
    <section aria-label={title} data-track="destinations">
      <p className={`mb-2 ${EYEBROW}`}>{title}</p>
      <p className="mb-3 text-foreground/75">{intro}</p>
      {/* Fixed height: about four rows show, the rest scroll inside the box. */}
      <ol
        tabIndex={0}
        aria-label={`${title}, scrollable`}
        className="max-h-[236px] overflow-y-auto 2xl:max-h-[540px] overscroll-contain rounded-[10px] border border-foreground/10 outline-none [scrollbar-width:thin] focus-visible:ring-2 focus-visible:ring-foreground/30"
      >
        {items.map((d, i) => (
          <li key={d.url} className={i ? "border-t border-foreground/10" : ""}>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors hover:bg-foreground/[0.04]"
            >
              <span className="w-4 font-mono text-[11px] text-foreground/40 tabular-nums">{i + 1}</span>
              <img
                src={asset(`/flags/${d.code}.svg`)}
                alt=""
                className="size-6 shrink-0 rounded-full shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-[3px]">
                  {d.name}
                </span>
                <span className="block text-foreground/55">{d.country}</span>
              </span>
              <span className="hidden gap-2.5 font-mono text-[11px] tabular-nums text-foreground/55 sm:flex">
                {SCORES.map(([key, label]) => (
                  <span
                    key={key}
                    title={`${label}: ${d.scores[key]}%`}
                    className="flex flex-col items-end leading-tight"
                  >
                    <span className="text-[9px] uppercase tracking-[0.06em] text-foreground/40">{label}</span>
                    {d.scores[key]}
                  </span>
                ))}
              </span>
              <span className="ml-1 rounded-[5px] bg-foreground/[0.07] px-1.5 py-0.5 font-mono text-[12px] font-medium tabular-nums">
                {overall(d)}
              </span>
              <NewTabArrow />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Apple's "Download on the App Store" badge: button height, or compact for table rows. */
export function AppStoreBadge({ href, size = "lg" }: { href: string; size?: "lg" | "sm" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-track="app_store_badge"
      className="inline-flex rounded-[10px] outline-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-foreground/40"
    >
      <img
        src={asset("/badges/app-store.svg")}
        alt="Download on the App Store"
        width={144}
        height={48}
        className="h-12 w-auto"
      />
    </a>
  );
}

/** A ↗ that fades in on hover of its `group` row: "opens in a new tab". Its slot is always there. */
function NewTabArrow() {
  return (
    <span
      aria-hidden
      className="w-3.5 shrink-0 text-[13px] text-foreground/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      ↗
    </span>
  );
}

/** Two editions side by side: a row per difference, then what they share across both columns. */
function Compare({ title, intro, columns, rows }: NonNullable<AppEntry["compare"]>) {
  return (
    <section aria-label={title}>
      <p className={`mb-2 ${EYEBROW}`}>{title}</p>
      <p className="mb-3 text-foreground/75">{intro}</p>
      <div className="overflow-hidden rounded-[10px] border border-foreground/10">
        <table className="w-full table-fixed border-collapse text-left text-[13px] leading-snug">
          <colgroup>
            <col className="w-[26%]" />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-foreground/[0.04]">
              <th scope="col" className="px-3 py-2" />
              {columns.map((c) => (
                <th key={c.label} scope="col" className="px-3 py-2 font-medium">
                  <span className="flex items-center gap-2">
                    <Flag code={c.code} />
                    {c.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-foreground/10 align-top">
                <th scope="row" className={`px-3 py-2.5 ${EYEBROW}`}>
                  {r.label}
                </th>
                {r.values.map((v, i) => (
                  <td key={i} className="px-3 py-2.5">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
