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
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        aria-label={`Open ${entry.name}`}
        className="relative size-[63.7px] shrink-0 cursor-pointer rounded-[22.5%] shadow-[0_4px_12px_rgba(0,0,0,0.18)] outline-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[22.5%] after:shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.3)] focus-visible:ring-2 focus-visible:ring-white"
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
      <span className="mt-[6.5px] max-w-[88px] truncate text-[12px] font-medium leading-[14px] tracking-[-0.1px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
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
        className={`flex size-full items-center justify-center rounded-[22.5%] bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500 font-semibold text-white ${className}`}
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
      className={`size-full select-none rounded-[22.5%] object-cover ${className}`}
    />
  );
}
