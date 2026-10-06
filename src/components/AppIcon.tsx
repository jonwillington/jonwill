import { useRef, useState } from "react";
import { motion } from "motion/react";

import type { AppEntry } from "../content/apps";

type Props = {
  entry: AppEntry;
  jiggle: boolean;
  /** Seed so neighbouring icons don't jiggle in sync. */
  index: number;
  onOpen: (entry: AppEntry, rect: DOMRect) => void;
  onLongPress: () => void;
};

export function AppIcon({ entry, jiggle, index, onOpen, onLongPress }: Props) {
  const timer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        type="button"
        aria-label={`Open ${entry.name}`}
        className="relative aspect-square w-full cursor-pointer rounded-[22%] shadow-[0_6px_16px_rgba(0,0,0,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-white"
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.88 }}
        animate={
          jiggle
            ? { rotate: [-2.5, 2.5, -2.5], transition: { repeat: Infinity, duration: 0.28, delay: (index % 3) * 0.07 } }
            : { rotate: 0 }
        }
        onPointerDown={() => {
          longPressed.current = false;
          timer.current = window.setTimeout(() => {
            longPressed.current = true;
            onLongPress();
          }, 550);
        }}
        onPointerUp={() => window.clearTimeout(timer.current)}
        onPointerLeave={() => window.clearTimeout(timer.current)}
        onClick={(e) => {
          if (longPressed.current) return;
          onOpen(entry, e.currentTarget.getBoundingClientRect());
        }}
      >
        <IconArt entry={entry} />
      </motion.button>
      <span className="max-w-full truncate text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">
        {entry.name}
      </span>
    </div>
  );
}

export function IconArt({ entry, className = "" }: { entry: AppEntry; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!entry.icon || failed) {
    return (
      <span
        className={`flex size-full items-center justify-center rounded-[22%] bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500 font-semibold text-white ${className}`}
      >
        JW
      </span>
    );
  }

  return (
    <img
      src={entry.icon}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className={`size-full select-none rounded-[22%] object-cover ${className}`}
    />
  );
}
