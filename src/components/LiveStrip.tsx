import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { formatGbp, type Live } from "../lib/live";
import { timeAgo, useNow } from "../lib/time";

/**
 * A slim line of live numbers in the header: the latest rated ddbx buy,
 * and coffee shops open across the network. Fades in once /api/live answers.
 */
export function LiveStrip({ live }: { live: Live | null }) {
  const now = useNow();
  const d = live?.ddbx;
  const openNow = live?.istanbrew?.openNow;
  const shops = live ? Object.values(live.network).reduce((n, c) => n + c.shops, 0) : 0;

  return (
    <div className="hidden items-center gap-5 font-mono text-[11px] tracking-[0.02em] text-foreground/55 lg:flex">
      <AnimatePresence>
        {d && (
          <Item key="ddbx" href={d.url} dot="#e8aa76">
            {d.rating[0].toUpperCase() + d.rating.slice(1)} buy · {d.company} {formatGbp(d.valueGbp)} ·{" "}
            {timeAgo(d.at, now)}
          </Item>
        )}
        {openNow != null && (
          <Item key="coffee" href="https://istanbrew.com" dot="#34c759">
            {openNow} coffee shops open now{shops ? ` · ${shops.toLocaleString("en-GB")} mapped` : ""}
          </Item>
        )}
      </AnimatePresence>
    </div>
  );
}

function Item({ href, dot, children }: { href: string; dot: string; children: ReactNode }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex max-w-[58ch] items-center gap-2 truncate transition-colors hover:text-foreground"
    >
      <span className="relative flex size-1.5 shrink-0">
        <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: dot }} />
        <span className="relative size-1.5 rounded-full" style={{ background: dot }} />
      </span>
      <span className="truncate">{children}</span>
    </motion.a>
  );
}
