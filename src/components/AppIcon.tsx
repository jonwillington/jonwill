import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { AppEntry } from "../content/apps";
import { iconClip } from "../lib/squircle";

type Props = {
  entry: AppEntry;
  jiggle: boolean;
  badge: boolean;
  /** Seed so neighbouring icons don't jiggle in sync. */
  index: number;
  onOpen: (entry: AppEntry, rect: DOMRect) => void;
  onLongPress: () => void;
};

export function AppIcon({ entry, jiggle, badge, index, onOpen, onLongPress }: Props) {
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
        <AnimatePresence>
          {badge && (
            // Size and position measured from an iPhone 17 home screen.
            <motion.span
              aria-label="1 notification"
              className="absolute left-[49px] top-[-11.3px] flex size-[25.7px] items-center justify-center rounded-full bg-[#eb4b46] text-[15px] font-medium leading-none text-white"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                transition: { delay: 0.4 + index * 0.08, type: "spring", stiffness: 500, damping: 18 },
              }}
              exit={{ scale: 0, transition: { duration: 0.15 } }}
            >
              1
            </motion.span>
          )}
        </AnimatePresence>
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
