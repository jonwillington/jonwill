import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";

import type { AppEntry } from "../../content/apps";
import { Splash } from "./Splash";

const ADVANCE_MS = 3800;
const LAUNCH_MS = 650;

/** The screens to show for an entry in the current theme, or null for splash-only apps. */
export function screensFor(entry: AppEntry, dark: boolean) {
  if (!entry.screens) return null;
  return (dark && entry.screens.dark) || entry.screens.light;
}

// UINavigationController's push: the new screen slides in over the old,
// which drifts a third of the way left and dims.
const push = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-30%", filter: dir > 0 ? "brightness(1)" : "brightness(0.8)" }),
  center: { x: "0%", filter: "brightness(1)" },
  exit: (dir: number) => ({ x: dir > 0 ? "-30%" : "100%", filter: dir > 0 ? "brightness(0.8)" : "brightness(1)" }),
};

/**
 * An opened app: a brief launch screen, then real screenshots that advance
 * on their own (paused on hover). Click or swipe to move between them.
 */
export function AppScreens({
  entry,
  dark,
  index,
  onIndex,
}: {
  entry: AppEntry;
  dark: boolean;
  index: number;
  onIndex: (i: number) => void;
}) {
  const screens = screensFor(entry, dark)!;
  const [launched, setLaunched] = useState(false);
  const [paused, setPaused] = useState(false);
  const direction = useRef(1);
  const prevIndex = useRef(index);

  if (index !== prevIndex.current) {
    // Wrapping from the last screen back to the first reads as "back".
    const forward = index > prevIndex.current && !(prevIndex.current === 0 && index === screens.length - 1);
    direction.current = forward || (prevIndex.current === screens.length - 1 && index === 0) ? 1 : -1;
    prevIndex.current = index;
  }

  // Warm the cache so pushes never flash.
  useEffect(() => {
    screens.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [screens]);

  useEffect(() => {
    const id = window.setTimeout(() => setLaunched(true), LAUNCH_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!launched || paused || screens.length < 2) return;
    const id = window.setTimeout(() => onIndex((index + 1) % screens.length), ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [launched, paused, index, screens.length, onIndex]);

  const go = (delta: number) => onIndex((index + delta + screens.length) % screens.length);

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 40 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
    go(info.offset.x < 0 ? 1 : -1);
  };

  return (
    <motion.div
      className="relative size-full cursor-pointer select-none overflow-hidden"
      onHoverStart={() => setPaused(true)}
      onHoverEnd={() => setPaused(false)}
      onPanEnd={onPanEnd}
      onClick={(e) => {
        // Left third goes back, like tapping a Back button; anywhere else goes forward.
        const box = e.currentTarget.getBoundingClientRect();
        go(e.clientX - box.left < box.width / 3 ? -1 : 1);
      }}
      role="group"
      aria-roledescription="app screens"
      aria-label={`${entry.name}, screen ${index + 1} of ${screens.length}`}
    >
      <AnimatePresence initial={false} custom={direction.current}>
        {/* The first screen sits under the launch screen from the start, so nothing slides in on launch. */}
        {
          <motion.img
            key={screens[index]}
            src={screens[index]}
            alt=""
            draggable={false}
            custom={direction.current}
            variants={push}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 34, mass: 0.9 }}
            className="absolute inset-0 size-full object-cover shadow-[-8px_0_24px_rgba(0,0,0,0.15)]"
          />
        }
      </AnimatePresence>

      {/* The launch screen fades away once the first screen is in place. */}
      <AnimatePresence>
        {!launched && (
          <motion.div
            className="absolute inset-0"
            style={{ background: entry.accent }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <Splash entry={entry} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
