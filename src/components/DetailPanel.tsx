import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Chip, CloseButton, buttonVariants } from "@heroui/react";

import type { AppEntry, Market, MarketCell, NetworkSite } from "../content/apps";
import type { Live } from "../lib/live";
import { IconArt } from "./AppIcon";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

/** Small uppercase label above a section, in the same mono as the chips. */
const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/55";

export function DetailContent({ entry, live, onClose }: { entry: AppEntry; live?: Live | null; onClose: () => void }) {
  return (
    <motion.div
      key={entry.id}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.05, delayChildren: 0.08 }}
      className="flex flex-col gap-5 text-[15px] leading-[1.6]"
    >
      {/* Icon, then the name beneath it. */}
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
        <CloseButton aria-label="Close" onPress={onClose} />
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => (
          <Chip
            key={tag}
            size="sm"
            className="rounded-[5px] bg-foreground/[0.07] px-2 font-mono text-[11px] uppercase tracking-[0.06em] text-foreground/80"
          >
            {tag}
          </Chip>
        ))}
      </motion.div>

      {entry.body.map((p, i) => (
        <motion.p key={i} variants={item}>
          {p}
        </motion.p>
      ))}

      {entry.highlights && (
        <motion.ul variants={item} className="flex flex-col gap-1.5">
          {entry.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2.5">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-foreground/45" aria-hidden />
              <span>{h}</span>
            </li>
          ))}
        </motion.ul>
      )}

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

      <motion.div variants={item} className="flex flex-wrap gap-2">
        {entry.links.map((link, i) => {
          const external = link.href.startsWith("http");
          return (
            <a
              key={link.href}
              href={link.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className={buttonVariants({
                size: "sm",
                // Neutral tints so the buttons sit on any app's background.
                className: i === 0 ? "bg-foreground text-background" : "bg-foreground/10 text-foreground",
              })}
            >
              {link.label}
              {external && <span aria-hidden>↗</span>}
            </a>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

const PLATFORMS = [
  ["web", "Web"],
  ["ios", "iOS"],
  ["android", "Android"],
] as const;

/** Markets down the side, platforms across the top; each cell links out or shows its status. */
function MarketGrid({ markets }: { markets: Market[] }) {
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
              {PLATFORMS.map(([, label]) => (
                <th key={label} scope="col" className={`px-3 py-2 ${EYEBROW}`}>
                  {label}
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
function Network({
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
