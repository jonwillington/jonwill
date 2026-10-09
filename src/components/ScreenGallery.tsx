import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import type { AppEntry } from "../content/apps";
import { track } from "../lib/analytics";
import { asset } from "../lib/asset";
import { CloseX } from "./CloseX";
import { screensFor } from "./phone/AppScreens";

const isVideo = (src: string) => src.endsWith(".mp4");

/**
 * Phones: an app's real screens as an App Store-style row you swipe through, each with its
 * caption. Tap one to see them full screen. On desktop the phone mockup does this job.
 */
export function ScreenGallery({ entry, dark }: { entry: AppEntry; dark: boolean }) {
  const screens = screensFor(entry, dark);
  const [viewing, setViewing] = useState<number | null>(null);
  if (!screens) return null;
  const captions = entry.screens?.captions ?? [];

  return (
    <section aria-label={`${entry.name} screens`}>
      {/* Bleeds to the screen edges so cards slide off the side, as in the App Store. */}
      <ol className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {screens.map((src, i) => (
          <li key={src} className="w-[58vw] max-w-[260px] shrink-0 snap-start">
            <button
              type="button"
              onClick={() => {
                track("screen_open", { app: entry.id, screen: i + 1 });
                setViewing(i);
              }}
              aria-label={`View screen ${i + 1} of ${screens.length} full screen${captions[i] ? `: ${captions[i]}` : ""}`}
              className="block w-full cursor-pointer"
            >
              <Shot src={src} eager={i < 2} />
            </button>
            {captions[i] && <p className="mt-2 text-[13px] leading-snug text-foreground/65">{captions[i]}</p>}
          </li>
        ))}
      </ol>

      {createPortal(
        <AnimatePresence>
          {viewing !== null && (
            <Viewer
              key="viewer"
              screens={screens}
              captions={captions}
              start={viewing}
              onClose={() => setViewing(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

/** One screen as a card: the shape of the phone it came from, corners and all. */
function Shot({ src, eager = false, fit = false }: { src: string; eager?: boolean; fit?: boolean }) {
  // In the row: a fixed phone-shaped card. Full screen: the whole screen, as big as fits.
  const className = `block rounded-[22px] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_10px_28px_-12px_rgba(0,0,0,0.35)] ${
    fit ? "h-auto max-h-full w-auto max-w-full" : "aspect-[804/1748] w-full bg-foreground/[0.06] object-cover"
  }`;
  // Screen recordings are 4:5 clips rather than full screens: shown whole, playing.
  if (isVideo(src))
    return (
      <video
        src={asset(src)}
        poster={asset(src.replace(/\.mp4$/, ".jpg"))}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        className={fit ? className : `${className} !aspect-[4/5] !object-contain`}
      />
    );
  return <img src={asset(src)} alt="" loading={eager ? "eager" : "lazy"} draggable={false} className={className} />;
}

/** Full screen: one screen at a time, swipe between them, the caption underneath. */
function Viewer({
  screens,
  captions,
  start,
  onClose,
}: {
  screens: string[];
  captions: string[];
  start: number;
  onClose: () => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);

  useEffect(() => {
    const el = strip.current;
    if (el) el.scrollLeft = start * el.clientWidth;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // The page underneath shouldn't scroll while this is up.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [start, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Screens"
      data-theme="dark"
      className="fixed inset-0 z-[80] flex flex-col bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <span className="font-mono text-[12px] tabular-nums text-white/60">
          {index + 1} / {screens.length}
        </span>
        <CloseX onPress={onClose} />
      </div>
      <div
        ref={strip}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {screens.map((src) => (
          <div key={src} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-6 py-4">
            <Shot src={src} fit eager />
          </div>
        ))}
      </div>
      <p className="min-h-[52px] px-6 pb-[max(20px,env(safe-area-inset-bottom))] text-center text-[14px] text-white/75">
        {captions[index] ?? ""}
      </p>
    </motion.div>
  );
}
