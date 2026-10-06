import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@heroui/react";

import { ALL_ENTRIES, type AppEntry } from "./content/apps";
import { DEVICE, Phone, Splash } from "./components/Phone";
import { DetailContent } from "./components/DetailPanel";

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

/** Fit the device to the window, leaving room for the header, hint and footer. */
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

export function App() {
  const desktop = useIsDesktop();
  const scale = useDeviceScale();
  const [open, setOpen] = useState<AppEntry | null>(fromHash);

  const openEntry = useCallback((entry: AppEntry) => {
    setOpen(entry);
    history.replaceState(null, "", `#${entry.id}`);
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    history.replaceState(null, "", window.location.pathname);
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

  // Phones: the page is the home screen, and an opened app is the detail view.
  if (!desktop) {
    return (
      <Phone
        framed={false}
        open={open}
        onOpen={openEntry}
        onClose={close}
        renderOpen={(entry) => (
          <div
            data-theme={entry.scheme ?? "dark"}
            className="size-full overflow-y-auto px-5 pb-16 pt-14 text-foreground"
            style={{ background: entry.accent }}
          >
            <DetailContent entry={entry} onClose={close} />
          </div>
        )}
      />
    );
  }

  return (
    <div
      data-theme={open ? (open.scheme ?? "dark") : "light"}
      className="relative isolate flex min-h-dvh flex-col overflow-hidden text-foreground"
    >
      <Ambient entry={open} />

      <header className="px-6 py-5 text-sm font-medium">Jon Willington</header>

      <main className="flex flex-1 items-center justify-center gap-16 px-6">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="flex flex-col items-center gap-5"
        >
          <Phone
            framed
            scale={scale}
            open={open}
            onOpen={openEntry}
            onClose={close}
            renderOpen={(entry) => <Splash entry={entry} />}
          />
          <p className={`text-sm text-muted transition-opacity ${open ? "opacity-0" : ""}`}>
            Tap an app. Press and hold to wiggle.
          </p>
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
              <DetailContent entry={open} onClose={close} />
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

/**
 * The page backdrop. Fades to the open app's colour, with a huge blurred
 * copy of its icon drifting behind the phone, so the whole page takes on
 * the app's mood.
 */
function Ambient({ entry }: { entry: AppEntry | null }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[#f5f5f5]" aria-hidden>
      <AnimatePresence>
        {entry && (
          <motion.div
            key={entry.id}
            className="absolute inset-0 overflow-hidden"
            style={{ background: entry.accent }}
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
                  entry.glow ?? (entry.scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)")
                } 0%, transparent 65%)`,
                opacity: entry.glow ? 0.45 : 1,
              }}
              initial={{ x: "-50%", y: "-50%", scale: 0.8 }}
              animate={{ x: "-50%", y: "-50%", scale: [1, 1.12, 1] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Soft vignette so text at the edges stays readable. */}
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(120% 90% at 50% 50%, transparent 40%, ${entry.accent} 100%)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
