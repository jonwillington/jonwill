import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@heroui/react";

import { ALL_ENTRIES, type AppEntry } from "./content/apps";
import { DEVICE, Phone } from "./components/Phone";
import { DetailContent } from "./components/DetailPanel";
import { ThemeToggle } from "./components/ThemeToggle";
import { AppScreens, screensFor } from "./components/phone/AppScreens";
import { Splash } from "./components/phone/Splash";
import { useLive } from "./lib/live";
import { useTheme } from "./lib/theme";

const fromHash = () => ALL_ENTRIES.find((e) => e.id === window.location.hash.slice(1)) ?? null;

function useIsDesktop() {
  const query = "(min-width: 1024px)";
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return matches;
}

/** Fit the device to the window, leaving room for the header, dots and footer. */
function useDeviceScale() {
  const fit = () => Math.min(1, Math.max(0.5, (window.innerHeight - 170) / DEVICE.height));
  const [scale, setScale] = useState(fit);
  useEffect(() => {
    const onResize = () => setScale(fit());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return scale;
}

const SEEN_KEY = "jonwill:seen";

/** Which apps this visitor has opened, remembered in their browser. */
function useSeen() {
  const [seen, setSeen] = useState<ReadonlySet<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"));
    } catch {
      return new Set();
    }
  });
  const markSeen = useCallback((id: string) => {
    setSeen((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...next]));
      } catch {
        // Private mode or blocked storage: badges just come back next visit.
      }
      return next;
    });
  }, []);
  return [seen, markSeen] as const;
}

/** Mix a hex colour towards another; used to darken app colours for dark mode. */
function mix(hex: string, into: string, amount: number) {
  const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = parse(hex);
  const b = parse(into);
  return `#${a
    .map((v, i) =>
      Math.round(v + (b[i] - v) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function App() {
  const desktop = useIsDesktop();
  const scale = useDeviceScale();
  const { mode, setMode, dark } = useTheme();
  const live = useLive();
  const [open, setOpen] = useState<AppEntry | null>(fromHash);
  const [screen, setScreen] = useState(0);

  const [seen, markSeen] = useSeen();
  // However an app was opened (tap, link or notification), its badge clears.
  useEffect(() => {
    if (open) markSeen(open.id);
    setScreen(0);
  }, [open, markSeen]);

  const openEntry = useCallback((entry: AppEntry) => {
    setOpen(entry);
    history.replaceState(null, "", `#${entry.id}`);
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onHash = () => setOpen(fromHash());
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
    };
  }, [close]);

  const screens = open ? screensFor(open, dark) : null;
  // In dark mode the page takes a deep tint of the app's colour instead of the colour itself.
  const pageAccent = open ? (dark ? mix(open.accent, "#0e0e10", 0.82) : open.accent) : null;
  const pageScheme = open ? (dark ? "dark" : (open.scheme ?? "dark")) : dark ? "dark" : "light";

  const phoneProps = {
    seen,
    live,
    dark,
    open,
    onOpen: openEntry,
    onClose: close,
    ownStatusBar: !!screens && desktop,
    lightApp:
      screens && desktop
        ? open!.screens!.scheme === "light" && !(dark && open!.screens!.dark)
        : open?.scheme === "light",
  };

  // Phones: the page is the home screen, and an opened app is the detail view.
  if (!desktop) {
    return (
      <Phone
        {...phoneProps}
        framed={false}
        renderOpen={(entry) => (
          <div
            data-theme={dark ? "dark" : (entry.scheme ?? "dark")}
            className="size-full overflow-y-auto px-5 pb-16 pt-14 text-foreground"
            style={{ background: dark ? mix(entry.accent, "#0e0e10", 0.82) : entry.accent }}
          >
            <DetailContent entry={entry} live={live} onClose={close} />
          </div>
        )}
      />
    );
  }

  return (
    <div data-theme={pageScheme} className="relative isolate flex min-h-dvh flex-col overflow-hidden text-foreground">
      <Ambient entry={open} accent={pageAccent} dark={dark} />

      <header className="flex items-center justify-between px-6 py-4 text-sm font-medium">
        <span>Jon Willington</span>
        <ThemeToggle mode={mode} onChange={setMode} />
      </header>

      <main className="flex flex-1 items-center justify-center gap-16 px-6">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="flex flex-col items-center gap-5"
        >
          <Phone
            {...phoneProps}
            framed
            scale={scale}
            renderOpen={(entry) =>
              screensFor(entry, dark) ? (
                <AppScreens entry={entry} dark={dark} index={screen} onIndex={setScreen} />
              ) : (
                <Splash entry={entry} />
              )
            }
          />
          <div className="flex h-5 items-center">
            <AnimatePresence mode="wait">
              {screens && screens.length > 1 ? (
                <ScreenDots key="dots" count={screens.length} index={screen} onSelect={setScreen} />
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: open ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted"
                >
                  Tap an app. Press and hold for more.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {open && (
            <motion.aside
              key={open.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="w-[min(440px,40vw)]"
            >
              <DetailContent entry={open} live={live} onClose={close} />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      <footer className="flex justify-between px-6 py-5 text-sm">
        <Link href="mailto:hey@jonwill.ing" className="text-muted">
          hey@jonwill.ing
        </Link>
        <Link
          href="https://www.linkedin.com/in/jonathanwillington/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted"
        >
          LinkedIn
        </Link>
      </footer>
    </div>
  );
}

/** Which real app screen is showing; click to jump. */
function ScreenDots({ count, index, onSelect }: { count: number; index: number; onSelect: (i: number) => void }) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      role="tablist"
      aria-label="App screens"
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={`Screen ${i + 1}`}
          onClick={() => onSelect(i)}
          className="flex h-5 cursor-pointer items-center"
        >
          <motion.span
            className="block h-[7px] rounded-full bg-foreground"
            animate={{ width: i === index ? 22 : 7, opacity: i === index ? 0.85 : 0.25 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </button>
      ))}
    </motion.div>
  );
}

/**
 * The page backdrop. Fades to the open app's colour, with a soft light
 * building up behind the phone, so the whole page takes on the app's mood.
 */
function Ambient({ entry, accent, dark }: { entry: AppEntry | null; accent: string | null; dark: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 transition-colors duration-700"
      style={{ background: dark ? "#0e0e10" : "#f5f5f5" }}
      aria-hidden
    >
      <AnimatePresence>
        {entry && accent && (
          <motion.div
            key={`${entry.id}-${dark}`}
            className="absolute inset-0 overflow-hidden"
            style={{ background: accent }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {/* A soft light drifting behind the phone: the icon's colour where it has one, otherwise a highlight. */}
            <motion.div
              className="absolute left-[32%] top-1/2 aspect-square w-[70vmax] rounded-full will-change-transform"
              style={{
                background: `radial-gradient(circle, ${
                  entry.glow ?? (dark || entry.scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)")
                } 0%, transparent 65%)`,
              }}
              // The colour change is quick; the glow builds up slowly after it.
              initial={{ x: "-50%", y: "-50%", scale: 0.9, opacity: 0 }}
              animate={{ x: "-50%", y: "-50%", scale: [1, 1.12, 1], opacity: entry.glow ? (dark ? 0.22 : 0.38) : 1 }}
              transition={{
                scale: { duration: 14, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 4, delay: 0.5, ease: [0.4, 0, 0.2, 1] },
              }}
            />
            {/* Soft vignette so text at the edges stays readable. */}
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(120% 90% at 50% 50%, transparent 40%, ${accent} 100%)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
