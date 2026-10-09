import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { track } from "../../lib/analytics";
import { asset } from "../../lib/asset";

const LAUNCH_MS = 1200;
/** Points per second for the slow scroll that shows the page off until someone takes over. */
const AUTO_SPEED = 38;

/**
 * Safari on iOS 26, showing a full-page capture of a mobile site. The page scrolls on its
 * own until someone scrolls or touches it; the toolbar shrinks to just the domain on the
 * way down and comes back on the way up, as Safari's does.
 */
export function Safari({ url, page, appId }: { url: string; page: string; appId: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const host = new URL(url).hostname.replace(/^www\./, "");

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    let last = 0;
    let stopped = false;
    // Sub-pixel progress: scrollTop rounds, so add to our own count and write that.
    let y = 0;
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
    const step = (t: number) => {
      if (stopped) return;
      if (last) {
        y += ((t - last) / 1000) * AUTO_SPEED;
        el.scrollTop = y;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) return stop();
      }
      last = t;
      frame = requestAnimationFrame(step);
    };
    const start = window.setTimeout(() => (frame = requestAnimationFrame(step)), LAUNCH_MS);
    const opts = { passive: true } as const;
    el.addEventListener("wheel", stop, opts);
    el.addEventListener("pointerdown", stop, opts);
    el.addEventListener("touchstart", stop, opts);
    return () => {
      window.clearTimeout(start);
      stop();
      el.removeEventListener("wheel", stop);
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("touchstart", stop);
    };
  }, []);

  // Shrink after 24pt on the way down, grow after 24pt on the way up or back at the top.
  // Measured from where the direction last changed, so a slow scroll counts as much as a fling.
  const lastTop = useRef(0);
  const turn = useRef({ down: true, at: 0 });
  const onScroll = () => {
    const top = scroller.current?.scrollTop ?? 0;
    const down = top > lastTop.current;
    if (top !== lastTop.current && down !== turn.current.down) turn.current = { down, at: lastTop.current };
    lastTop.current = top;
    if (top < 40) setCompact(false);
    else if (down && top - turn.current.at > 24) setCompact(true);
    else if (!down && turn.current.at - top > 24) setCompact(false);
  };

  const openSite = () => {
    track("safari_open_site", { app: appId });
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="relative size-full bg-white text-neutral-900">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="size-full overflow-y-auto overscroll-contain pt-[54px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <img src={asset(page)} alt={`${host} on an iPhone`} draggable={false} className="block w-full" />
        {/* Room to scroll the end of the page clear of the toolbar. */}
        <div className="h-[110px]" />
      </div>

      {/* Behind the status bar: the page blurs under it, as in Safari. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[54px] bg-white/80 backdrop-blur-xl" />

      {/* The toolbar floats over the page, above the home indicator. */}
      <div className="absolute inset-x-0 bottom-[30px] flex items-center justify-center gap-2 px-4">
        <motion.div
          initial={false}
          animate={{ opacity: compact ? 0 : 1, scale: compact ? 0.6 : 1, width: compact ? 0 : 48 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="shrink-0 overflow-hidden"
        >
          <ToolbarCircle label="Back">
            <path d="M14.5 5.5 8 12l6.5 6.5" />
          </ToolbarCircle>
        </motion.div>

        <motion.button
          type="button"
          onClick={openSite}
          aria-label={`Open ${host}`}
          initial={false}
          animate={{ height: compact ? 34 : 48, width: compact ? 150 : 250 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className={`${GLASS} relative flex cursor-pointer items-center justify-center rounded-full`}
        >
          <motion.span
            initial={false}
            animate={{ opacity: compact ? 0 : 1 }}
            className="absolute left-4 text-neutral-800"
            aria-hidden
          >
            {/* Page menu: a page with a list on it. */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8 9.5h8M8 14.5h5" strokeLinecap="round" />
            </svg>
          </motion.span>
          <motion.span
            initial={false}
            animate={{ fontSize: compact ? "13px" : "17px" }}
            className="font-medium tracking-[-0.3px]"
          >
            {host}
          </motion.span>
          <motion.span
            initial={false}
            animate={{ opacity: compact ? 0 : 1 }}
            className="absolute right-4 text-neutral-800"
            aria-hidden
          >
            {/* Reload. */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12a7 7 0 1 1-2.05-4.95" />
              <path d="M19 4.5v4h-4" strokeLinejoin="round" />
            </svg>
          </motion.span>
        </motion.button>

        <motion.div
          initial={false}
          animate={{ opacity: compact ? 0 : 1, scale: compact ? 0.6 : 1, width: compact ? 0 : 48 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="shrink-0 overflow-hidden"
        >
          <ToolbarCircle label="More">
            <circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none" />
          </ToolbarCircle>
        </motion.div>
      </div>
    </div>
  );
}

/** Safari's Liquid Glass: frosted white with a bright rim, so it reads over any page. */
const GLASS =
  "bg-white/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25),inset_0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]";

/** A round toolbar button. Decorative: the page is a picture, so there's nowhere to go back to. */
function ToolbarCircle({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span aria-label={label} role="img" className={`${GLASS} flex size-12 items-center justify-center rounded-full text-neutral-800`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}
