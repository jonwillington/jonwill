import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@heroui/react";

import { ALL_ENTRIES, type AppEntry } from "./content/apps";
import { DEVICE, Phone } from "./components/Phone";
import { AppDrawer } from "./components/AppDrawer";
import { DetailContent } from "./components/DetailPanel";
import { AppSwitcher } from "./components/AppSwitcher";
import { CloseX } from "./components/CloseX";
import { LiveStrip } from "./components/LiveStrip";
import { ThemeToggle } from "./components/ThemeToggle";
import { AppScreens, screensFor } from "./components/phone/AppScreens";
import { Splash } from "./components/phone/Splash";
import { useLive } from "./lib/live";
import { useTheme } from "./lib/theme";
import { SITE } from "./content/site";

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

/**
 * Fit the device to the window, leaving room for the header, dots and footer.
 * Big windows get a larger phone (up to 1.15x), as long as it leaves room for the panel.
 */
function useDeviceScale() {
  const fit = () =>
    Math.max(
      0.5,
      Math.min(1.15, (window.innerHeight - 230) / DEVICE.height, (window.innerWidth * 0.36) / DEVICE.width),
    );
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
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useRef(false);
  drawerRef.current = drawer;

  const [seen, markSeen] = useSeen();
  // However an app was opened (tap, link or notification), its badge clears.
  useEffect(() => {
    if (open) markSeen(open.id);
    setScreen(0);
    setDrawer(false);
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
    // With the drawer open, Escape belongs to the drawer. Vaul closes it before this
    // listener runs, so note whether it was open as the key goes down (capture phase).
    let drawerWasOpen = false;
    const onKeyCapture = (e: KeyboardEvent) => {
      if (e.key === "Escape") drawerWasOpen = drawerRef.current;
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !drawerWasOpen && close();
    const onHash = () => setOpen(fromHash());
    window.addEventListener("keydown", onKeyCapture, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("keydown", onKeyCapture, true);
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
    // Screenshots carry their own status bar; clips are cards, so the phone draws one.
    ownStatusBar: !!screens && desktop && !screens.some((src) => src.endsWith(".mp4")),
    lightApp:
      screens && desktop
        ? open!.screens!.scheme === "light" && !(dark && open!.screens!.dark)
        : open?.scheme === "light",
  };

  // Phones: the page is the home screen, and an opened app is the detail view.
  if (!desktop) {
    return (
      <div data-vaul-drawer-wrapper="" className="min-h-dvh">
        <Phone
          {...phoneProps}
          framed={false}
          renderOpen={(entry) => (
            <div
              data-theme={dark ? "dark" : (entry.scheme ?? "dark")}
              className="size-full overflow-y-auto px-5 pb-16 pt-14 text-foreground"
              style={{ background: dark ? mix(entry.accent, "#0e0e10", 0.82) : entry.accent }}
            >
              <DetailContent entry={entry} live={live} onClose={close} onLearnMore={() => setDrawer(true)} />
            </div>
          )}
        />
        <AppDrawer
          entry={open}
          open={drawer}
          onOpenChange={setDrawer}
          dark={dark}
          background={pageAccent ?? (dark ? "#141416" : "#fafafa")}
        />
      </div>
    );
  }

  return (
    <>
      {/* data-vaul-drawer-wrapper: the page that scales back when the drawer opens. */}
      <div
        data-vaul-drawer-wrapper=""
        data-theme={pageScheme}
        className="relative isolate flex h-dvh min-h-[600px] flex-col overflow-hidden text-foreground"
      >
        <Ambient entry={open} accent={pageAccent} dark={dark} />

        <header className="flex h-[72px] shrink-0 items-center justify-between px-6 text-sm font-medium">
          <span>{SITE.name}</span>
          <LiveStrip live={live} />
          <div className="flex items-center">
            <ThemeToggle mode={mode} onChange={setMode} />
            {/* Closing the app lives top right, where it covers the whole page. Its slot opens and
                closes with a spring, so the theme toggle glides aside and back rather than jumping. */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="close"
                  className="flex justify-end overflow-hidden"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 52, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{
                    width: { type: "spring", stiffness: 420, damping: 36 },
                    opacity: { duration: 0.18 },
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.6, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0.6, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  >
                    <CloseX onPress={close} label={`Close ${open.name}`} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 items-center justify-center gap-16 px-6 2xl:gap-20">
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
            {/* A caption-sized line under the phone saying what the current screen shows. */}
            <div className="flex h-[52px] w-full flex-col items-center justify-start gap-2.5">
              <AnimatePresence mode="wait">
                {screens && screens.length > 1 ? (
                  <motion.div
                    key={`screens-${open?.id}`}
                    className="flex w-full flex-col items-center gap-2.5"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                  >
                    {/* As wide as the phone, never wider: a wider caption widened the column and nudged the panel. */}
                    <div className="relative h-5 w-full overflow-hidden text-center">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.p
                          key={screen}
                          aria-live="polite"
                          className="absolute inset-x-0 truncate text-[13px] leading-5 text-foreground/65"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                        >
                          {open?.screens?.captions?.[screen] ?? ""}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <ScreenDots count={screens.length} index={screen} onSelect={setScreen} />
                  </motion.div>
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
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                // Eases in and stops dead: a spring here overshot and settled back, a visible wobble.
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={`w-[min(440px,40vw)] ${open.markets || open.network || open.destinations ? "2xl:w-[min(860px,50vw)]" : ""}`}
              >
                <DetailContent
                  entry={open}
                  live={live}
                  showClose={false}
                  onClose={close}
                  onLearnMore={() => setDrawer(true)}
                />
              </motion.aside>
            )}
          </AnimatePresence>
        </main>

        <footer className="grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center px-6 text-sm">
          <Link href={`mailto:${SITE.email}`} className="justify-self-start text-muted">
            {SITE.email}
          </Link>
          {/* Only inside an app: hop to another without going home. The footer has a fixed
              height, so it arriving or leaving never shifts anything. */}
          <AnimatePresence>
            {open ? (
              <motion.div
                key="switcher"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
              >
                <AppSwitcher open={open} onOpen={openEntry} />
              </motion.div>
            ) : (
              <span key="spacer" />
            )}
          </AnimatePresence>
          <Link
            href={SITE.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="justify-self-end text-muted"
          >
            LinkedIn
          </Link>
        </footer>
      </div>
      <AppDrawer
        entry={open}
        open={drawer}
        onOpenChange={setDrawer}
        dark={dark}
        background={pageAccent ?? (dark ? "#141416" : "#fafafa")}
      />
    </>
  );
}

/** Which real app screen is showing; click to jump. */
function ScreenDots({ count, index, onSelect }: { count: number; index: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="App screens">
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
    </div>
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
