import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@heroui/react";

import { ALL_ENTRIES, type AppEntry } from "./content/apps";
import { DEVICE, Phone } from "./components/Phone";
import { AppDrawer } from "./components/AppDrawer";
import { ContactCard } from "./components/phone/ContactCard";
import { Safari } from "./components/phone/Safari";
import { DetailContent } from "./components/DetailPanel";
import { AppSwitcher } from "./components/AppSwitcher";
import { CloseX } from "./components/CloseX";
import { ThemeToggle } from "./components/ThemeToggle";
import { AppScreens, screensFor } from "./components/phone/AppScreens";
import { Splash } from "./components/phone/Splash";
import { track, trackApp } from "./lib/analytics";
import { useLive } from "./lib/live";
import { useTheme } from "./lib/theme";
import { SITE } from "./content/site";

/** Expo-out: quick to start, long gentle landing. Shared by the phone's moves. */
const PHONE_EASE = [0.16, 1, 0.3, 1] as const;

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
  // Which screen is showing, tagged with the app it belongs to: a screen number left over
  // from the previous app (Istanbrew's 4th) can't be used for the next (GA Bridge has 2).
  const [screenState, setScreenState] = useState<{ id: string | null; index: number }>({ id: null, index: 0 });
  const [drawer, setDrawer] = useState(false);
  // Mirrors the phone's lock screen; starts as the phone will (see Phone's `locked`).
  const [phoneLocked, setPhoneLocked] = useState(() => {
    try {
      return !window.location.hash && sessionStorage.getItem("jonwill:unlocked") !== "1";
    } catch {
      return !window.location.hash;
    }
  });
  const drawerRef = useRef(false);
  drawerRef.current = drawer;

  const [seen, markSeen] = useSeen();
  // Analytics: how each app was opened and closed, and how long it stayed open.
  const openSource = useRef<string>(window.location.hash ? "deep_link" : "unknown");
  const closeMethod = useRef<string>("unknown");
  const lastOpen = useRef<{ id: string; at: number } | null>(null);

  // However an app was opened (tap, link or notification), its badge clears.
  useEffect(() => {
    const prev = lastOpen.current;
    if (prev && prev.id !== open?.id) {
      track("app_close", {
        app: prev.id,
        method: open ? "switched_app" : closeMethod.current,
        seconds_open: Math.round((Date.now() - prev.at) / 1000),
      });
    }
    if (open && prev?.id !== open.id) {
      track("app_open", { app: open.id, source: openSource.current, first_time: !seen.has(open.id) });
      markSeen(open.id);
      trackApp(open.id, open.name);
    }
    lastOpen.current = open ? { id: open.id, at: prev?.id === open.id ? prev.at : Date.now() } : null;
    openSource.current = "hash";
    closeMethod.current = "unknown";
    setDrawer(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, markSeen]);

  const onDrawerChange = useCallback(
    (next: boolean) => {
      if (!next && drawerRef.current) track("learn_more_close", { app: open?.id });
      setDrawer(next);
    },
    [open],
  );

  const openEntry = useCallback((entry: AppEntry, source = "unknown") => {
    openSource.current = source;
    setOpen(entry);
    history.replaceState(null, "", `#${entry.id}`);
  }, []);

  const close = useCallback((method = "close_button") => {
    closeMethod.current = method;
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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !drawerWasOpen && close("escape");
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
  const screen = open && screenState.id === open.id ? Math.min(screenState.index, (screens?.length ?? 1) - 1) : 0;
  const setScreen = useCallback(
    (index: number, method = "dots") => {
      setScreenState({ id: open?.id ?? null, index });
      track("app_screen", { app: open?.id, screen: index + 1, method });
    },
    [open],
  );
  // In dark mode the page takes a deep tint of the app's colour instead of the colour itself.
  const pageAccent = open ? (dark ? mix(open.accent, "#0e0e10", 0.82) : open.accent) : null;
  const pageScheme = open ? (dark ? "dark" : (open.scheme ?? "dark")) : dark ? "dark" : "light";

  const phoneProps = {
    seen,
    live,
    dark,
    open,
    onOpen: openEntry,
    onClose: () => close("home_indicator"),
    // Screenshots carry their own status bar; clips are cards, so the phone draws one.
    ownStatusBar: !!screens && desktop && !screens.some((src) => src.endsWith(".mp4")),
    // The contact card is dark below its light top: dark status bar text, but a light home indicator.
    lightApp:
      open?.id === "about" && desktop
        ? false
        : screens && desktop
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
              <DetailContent
                entry={entry}
                live={live}
                onClose={() => close("close_button")}
                onLearnMore={() => {
                  track("learn_more", { app: open?.id });
                  setDrawer(true);
                }}
              />
            </div>
          )}
        />
        <AppDrawer
          entry={open}
          open={drawer}
          onOpenChange={onDrawerChange}
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

        <header className="relative z-20 flex h-[72px] shrink-0 items-center justify-between px-6 text-sm font-medium">
          <span data-heading>{SITE.name}</span>
          <div className="flex items-center">
            <ThemeToggle
              mode={mode}
              onChange={(m) => {
                track("theme_change", { mode: m, from: mode });
                setMode(m);
              }}
            />
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
                    <CloseX onPress={() => close("close_button")} label={`Close ${open.name}`} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 items-center justify-center gap-16 px-6 2xl:gap-20">
          <motion.div
            layout
            // One curve for every move the phone makes (sliding aside for the panel, settling
            // after unlock), so when they happen together they read as a single motion.
            transition={{ duration: 0.9, ease: PHONE_EASE }}
            className="flex flex-col items-center gap-5"
          >
            {/* The entrance: while the lock screen is up, the phone is huge and pinned by its bottom
                edge, so the home bar and "Swipe up to open" are right there and the top runs off
                the window (the page clips it). Swiping up to unlock pulls it back to its resting
                size. It never moves on its own. */}
            <motion.div
              className="relative z-10"
              style={{ transformOrigin: "50% 100%" }}
              initial={false}
              animate={phoneLocked ? { scale: 2.1 } : { scale: 1 }}
              transition={{ duration: 0.9, ease: PHONE_EASE }}
            >
              <Phone
                {...phoneProps}
                framed
                scale={scale}
                onLockedChange={setPhoneLocked}
                renderOpen={(entry) =>
                  entry.id === "about" ? (
                    <ContactCard onBack={() => close("contact_back")} />
                  ) : entry.browser ? (
                    <Safari url={entry.browser.url} page={entry.browser.page} appId={entry.id} />
                  ) : screensFor(entry, dark) ? (
                    <AppScreens entry={entry} dark={dark} index={screen} onIndex={setScreen} />
                  ) : (
                    <Splash entry={entry} />
                  )
                }
              />
            </motion.div>
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
                    // Hidden while locked: the lock screen says "Swipe up to open" itself.
                    animate={{ opacity: open || phoneLocked ? 0 : 1 }}
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
                // Follows the phone out of the way: a beat behind it, on the same curve.
                transition={{ duration: 0.65, delay: 0.12, ease: PHONE_EASE }}
                className={`w-[min(440px,40vw)] ${
                  open.markets || open.network || open.destinations || open.compare
                    ? "2xl:w-[min(860px,50vw)]"
                    : open.hiring
                      ? "xl:w-[min(820px,54vw)]"
                      : ""
                }`}
              >
                <DetailContent
                  entry={open}
                  live={live}
                  showClose={false}
                  onClose={() => close("close_button")}
                  onLearnMore={() => {
                    track("learn_more", { app: open?.id });
                    setDrawer(true);
                  }}
                />
              </motion.aside>
            )}
          </AnimatePresence>
        </main>

        <footer className="grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center px-6 text-sm">
          <Link href={`mailto:${SITE.email}`} className="justify-self-start text-muted">
            {SITE.email}
          </Link>
          {/* Only inside an app: hop to another without going home. It lives in one fixed middle
              cell: swapping it for a spacer meant both existed while it faded out, the grid got a
              fourth item, and LinkedIn wrapped onto a new row. */}
          <div className="flex justify-center">
            <AnimatePresence>
              {open && (
                <motion.div
                  key="switcher"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                >
                  <AppSwitcher open={open} onOpen={openEntry} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
        onOpenChange={onDrawerChange}
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
            {/* A faint wash of the icon's colour across the whole page, not a spotlight behind
                the phone. It builds up slowly after the colour change. */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(150% 130% at 30% 50%, ${
                  entry.glow ?? (dark || entry.scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.5)")
                } 0%, transparent 90%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: entry.glow ? (dark ? 0.08 : 0.12) : 1 }}
              transition={{ duration: 4, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
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
