import { useRef, useState } from "react";
import { motion } from "motion/react";

import type { AppEntry } from "../content/apps";
import { iconClip } from "../lib/squircle";

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
        className="relative size-[64px] shrink-0 cursor-pointer outline-none [filter:drop-shadow(0_2px_5px_rgba(0,0,0,0.12))] focus-visible:[filter:drop-shadow(0_0_2px_white)]"
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

/**
 * An app icon clipped to the iOS icon shape at `size` px. `round` draws a
 * circle instead, for my photo.
 */
export function IconArt({ entry, size = 64, round = false }: { entry: AppEntry; size?: number; round?: boolean }) {
  const [failed, setFailed] = useState(false);
  const shape = round ? { borderRadius: "9999px" } : { clipPath: iconClip(size) };

  if (!entry.icon || failed) {
    return (
      <span
        className="flex size-full items-center justify-center bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500 font-semibold text-white"
        style={shape}
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
      className="size-full select-none object-cover"
      style={shape}
    />
  );
}
