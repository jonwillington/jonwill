import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { ISLAND } from "./constants";
import { track } from "../../lib/analytics";

const BREW_SECONDS = 210; // A V60: three and a half minutes.
const ORANGE = "#ff9f0a";

type Mode = "compact" | "expanded" | "done";

// Sizes follow iOS: the compact activity hugs the camera and stays clear of the
// clock (the signal bars give way); expanded drops into a card.
const SIZE: Record<Mode, { width: number; height: number; radius: number; left: number; top: number }> = {
  compact: {
    width: ISLAND.width + 84,
    height: ISLAND.height,
    radius: ISLAND.height / 2,
    left: ISLAND.left - 42,
    top: ISLAND.top,
  },
  expanded: { width: 374, height: 168, radius: 46, left: 14, top: 10 },
  done: {
    width: ISLAND.width + 92,
    height: ISLAND.height + 8,
    radius: (ISLAND.height + 8) / 2,
    left: ISLAND.left - 46,
    top: ISLAND.top - 4,
  },
};

/**
 * A Live Activity in the Dynamic Island: a pour-over brew timer. The bezel
 * image draws the resting island; this black shape grows out of it.
 */
export function DynamicIsland({
  onOpenIstanbrew,
  onFinished,
}: {
  onOpenIstanbrew: () => void;
  onFinished: () => void;
}) {
  const [mode, setMode] = useState<Mode>("compact");
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  const left = Math.max(0, BREW_SECONDS - Math.floor((now - startedAt) / 1000));
  const progress = 1 - left / BREW_SECONDS;
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (left === 0 && mode !== "done") setMode("done");
  }, [left, mode]);

  useEffect(() => {
    if (mode === "done") {
      const id = window.setTimeout(onFinished, 4500);
      return () => window.clearTimeout(id);
    }
    if (mode === "expanded") {
      // Like iOS, an expanded activity settles back to compact on its own.
      const id = window.setTimeout(() => setMode("compact"), 7000);
      return () => window.clearTimeout(id);
    }
  }, [mode, onFinished]);

  const s = SIZE[mode];

  return (
    <motion.div
      role="status"
      aria-label={mode === "done" ? "Coffee's ready" : `Brewing a V60, ${clock} left`}
      className="absolute z-[55] cursor-pointer overflow-hidden bg-black text-white"
      initial={{
        width: ISLAND.width,
        height: ISLAND.height,
        left: ISLAND.left,
        top: ISLAND.top,
        borderRadius: ISLAND.height / 2,
      }}
      animate={{ width: s.width, height: s.height, left: s.left, top: s.top, borderRadius: s.radius }}
      exit={{
        width: ISLAND.width,
        height: ISLAND.height,
        left: ISLAND.left,
        top: ISLAND.top,
        borderRadius: ISLAND.height / 2,
      }}
      transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.9 }}
      onClick={() => {
        track("live_activity_tap", { action: mode === "compact" ? "expand" : "collapse" });
        setMode((m) => (m === "compact" ? "expanded" : m === "expanded" ? "compact" : m));
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {mode === "compact" && (
          <Fade key="compact" className="flex h-full items-center justify-between pl-[14px] pr-[9px]">
            <Cup size={20} />
            <span className="text-[15px] font-semibold tabular-nums" style={{ color: ORANGE }}>
              {clock}
            </span>
          </Fade>
        )}

        {mode === "done" && (
          <Fade key="done" className="flex h-full items-center justify-between px-[14px]">
            <Cup size={22} steaming />
            <span className="text-[15px] font-semibold" style={{ color: ORANGE }}>
              Ready
            </span>
          </Fade>
        )}

        {mode === "expanded" && (
          <Fade key="expanded" className="flex h-full flex-col px-[22px] pb-[18px] pt-[16px]">
            {/* The middle of the top row sits under the camera, so content keeps to the sides. */}
            <span className="flex items-start justify-between">
              <span className="flex size-[44px] items-center justify-center rounded-[13px] bg-white/10">
                <Cup size={28} steaming />
              </span>
              <span className="text-right">
                <span className="block text-[13px] text-white/55">Brewing</span>
                <span className="block text-[17px] font-semibold">V60</span>
              </span>
            </span>
            <span className="mt-[10px] flex items-end justify-between">
              <span>
                <span className="block text-[15px] font-semibold">Pour-over in Kadıköy</span>
                <span className="block text-[13px] text-white/55">Beans from an Istanbrew pick</span>
              </span>
              <span
                className="text-[34px] font-semibold leading-none tracking-[-1px] tabular-nums"
                style={{ color: ORANGE }}
              >
                {clock}
              </span>
            </span>
            <span className="mt-auto flex items-center gap-[12px]">
              <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-white/15">
                <motion.span
                  className="block h-full rounded-full"
                  style={{ background: ORANGE }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.9, ease: "linear" }}
                />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenIstanbrew();
                }}
                className="cursor-pointer rounded-full bg-white/15 px-[12px] py-[5px] text-[13px] font-semibold"
              >
                Istanbrew
              </button>
            </span>
          </Fade>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Fade({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      initial={{ opacity: 0, filter: "blur(6px)", scale: 0.92 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1, transition: { delay: 0.12, duration: 0.25 } }}
      exit={{ opacity: 0, filter: "blur(6px)", scale: 0.92, transition: { duration: 0.12 } }}
    >
      {children}
    </motion.div>
  );
}

/** A small cup glyph in the activity's orange. */
function Cup({ size, steaming = false }: { size: number; steaming?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      {steaming &&
        [8, 12].map((x, i) => (
          <motion.path
            key={x}
            d={`M${x} 6c-1.2-1.2 1.2-2 0-3.5`}
            stroke={ORANGE}
            strokeWidth="1.6"
            strokeLinecap="round"
            animate={{ opacity: [0, 1, 0], y: [1, -1, -2] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.5 }}
          />
        ))}
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" fill={ORANGE} />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" stroke={ORANGE} strokeWidth="1.8" />
      <path d="M3 21h14" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
