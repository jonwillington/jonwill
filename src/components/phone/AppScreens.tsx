import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";

import type { AppEntry } from "../../content/apps";
import { track } from "../../lib/analytics";
import { asset } from "../../lib/asset";

const ADVANCE_MS = 3800;
const isVideo = (src: string) => src.endsWith(".mp4");
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
 * An opened app: its real screenshots, straight away, advancing on their own
 * (paused on hover). Click or swipe to move between them.
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
  /** `method`: how the screen changed (auto, tap, swipe, video_end, dots), for analytics. */
  onIndex: (i: number, method?: string) => void;
}) {
  const screens = screensFor(entry, dark)!;
  // Belt and braces: never index past this app's screens.
  index = Math.min(Math.max(index, 0), screens.length - 1);
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

  // Warm the cache so pushes never flash (videos stream on their own).
  useEffect(() => {
    screens.forEach((src) => {
      if (isVideo(src)) return;
      const img = new Image();
      img.src = asset(src);
    });
  }, [screens]);

  // Wait for the zoom-open before the first auto-advance or video play, but show the screen straight away.
  useEffect(() => {
    const id = window.setTimeout(() => setLaunched(true), LAUNCH_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    // Videos move on when they finish instead of on a timer.
    if (!launched || paused || screens.length < 2 || isVideo(screens[index])) return;
    const id = window.setTimeout(() => onIndex((index + 1) % screens.length, "auto"), ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [launched, paused, index, screens.length, onIndex]);

  const go = (delta: number, method: string) => onIndex((index + delta + screens.length) % screens.length, method);

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 40 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
    go(info.offset.x < 0 ? 1 : -1, "swipe");
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
        go(e.clientX - box.left < box.width / 3 ? -1 : 1, "tap");
      }}
      role="group"
      aria-roledescription="app screens"
      aria-label={`${entry.name}, screen ${index + 1} of ${screens.length}`}
    >
      <AnimatePresence initial={false} custom={direction.current}>
        {/* initial={false} on the presence: the first screen is simply there, nothing slides in on open. */}
        <motion.div
          key={screens[index]}
          custom={direction.current}
          variants={push}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 34, mass: 0.9 }}
          className="absolute inset-0 shadow-[-8px_0_24px_rgba(0,0,0,0.15)]"
          style={{ background: entry.accent }}
        >
          {isVideo(screens[index]) ? (
            <Clip
              src={asset(screens[index])}
              playing={launched}
              onEnded={() => {
                track("video_complete", { app: entry.id, video: screens[index].split("/").pop() });
                if (!paused && screens.length > 1) onIndex((index + 1) % screens.length, "video_end");
              }}
            />
          ) : (
            <img src={asset(screens[index])} alt="" draggable={false} className="size-full object-cover" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * A screen recording that isn't full-screen (4:5 clips): shown as a card
 * under the status bar, like an App Store preview. Its caption sits under the phone.
 */
function Clip({ src, playing, onEnded }: { src: string; playing: boolean; onEnded: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-5 px-5 pt-10">
      <video
        ref={ref}
        src={asset(src)}
        poster={asset(src.replace(/\.mp4$/, ".jpg"))}
        muted
        playsInline
        preload="metadata"
        onEnded={onEnded}
        // A fixed 4:5 box: without it the video is 150px tall until its metadata loads, then jumps,
        // and clips of slightly different heights would resize the card between screens.
        className="aspect-[4/5] w-full rounded-[22px] bg-neutral-100 object-cover object-top shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.12)]"
      />
    </div>
  );
}
