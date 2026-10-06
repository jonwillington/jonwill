import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Chip, buttonVariants } from "@heroui/react";

import type { AppEntry, Destination, Market, MarketCell, NetworkSite } from "../content/apps";
import type { Live } from "../lib/live";
import { IconArt } from "./AppIcon";
import { CloseX } from "./CloseX";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

/** Small uppercase label above a section, in the same mono as the chips. */
export const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55";

/** The summary beside the phone: who or what, in a few lines, with a way into the details. */
export function DetailContent({
  entry,
  live,
  onClose,
  onLearnMore,
}: {
  entry: AppEntry;
  live?: Live | null;
  onClose: () => void;
  onLearnMore: () => void;
}) {
  return (
    <motion.div
      key={entry.id}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.05, delayChildren: 0.08 }}
      className="flex flex-col gap-5 text-[15px] leading-[1.6]"
    >
      {/* Icon, then the name beneath it, and a one-line description. */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <div className="size-16 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.10))]">
            <IconArt entry={entry} size={64} round={entry.id === "about"} />
          </div>
          <h2 className="mt-4 text-[26px] font-semibold leading-tight tracking-[-0.02em]">
            {entry.id === "about" ? "Jon Willington" : entry.name}
          </h2>
          <p className="mt-0.5 text-foreground/65">{entry.tagline}</p>
        </div>
        <CloseX onPress={onClose} />
      </motion.div>

      <motion.div variants={item}>
        <Tags tags={entry.tags} />
      </motion.div>

      {/* The rich data stays on the page; the longer story lives in the drawer. */}
      {entry.markets && (
        <motion.div variants={item}>
          <MarketGrid markets={entry.markets} />
        </motion.div>
      )}
      {entry.network && (
        <motion.div variants={item}>
          <Network {...entry.network} counts={live?.network} />
        </motion.div>
      )}
      {entry.destinations && (
        <motion.div variants={item}>
          <Destinations {...entry.destinations} />
        </motion.div>
      )}
      {!entry.markets && !entry.network && !entry.destinations && (
        <motion.p variants={item} className="text-foreground/80">
          {entry.body[0]}
        </motion.p>
      )}

      <motion.div variants={item} className="flex flex-wrap gap-2">
        {entry.links[0] && <LinkButton link={entry.links[0]} primary />}
        <button
          type="button"
          onClick={onLearnMore}
          className={buttonVariants({ size: "sm", className: "bg-foreground/10 text-foreground" })}
        >
          Learn more
          <svg
            width="12"
            height="12"
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
      </motion.div>
    </motion.div>
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
        size: "sm",
        // Neutral tints so the buttons sit on any app's background.
        className: primary ? "bg-foreground text-background" : "bg-foreground/10 text-foreground",
      })}
    >
      {link.label}
      {external && <span aria-hidden>↗</span>}
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
    <section aria-label="Availability by market and platform">
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
    <section aria-label={title}>
      <p className={`mb-2 ${EYEBROW}`}>{title}</p>
      <p className="mb-3 text-foreground/75">{intro}</p>
      <ul className="overflow-hidden rounded-[10px] border border-foreground/10">
        {sites.map((s, i) => (
          <li key={s.url} className={i ? "border-t border-foreground/10" : ""}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors hover:bg-foreground/[0.04] ${i === 0 ? "bg-foreground/[0.03]" : ""}`}
              aria-current={i === 0 ? "page" : undefined}
            >
              <img src={s.icon} alt="" className="size-7 rounded-[7px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.12)]" />
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
            </a>
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
    <section aria-label={title}>
      <p className={`mb-2 ${EYEBROW}`}>{title}</p>
      <p className="mb-3 text-foreground/75">{intro}</p>
      <ol className="overflow-hidden rounded-[10px] border border-foreground/10">
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
                src={`/flags/${d.code}.svg`}
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
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
