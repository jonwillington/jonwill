import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Link } from "@heroui/react";

import { ALL_ENTRIES, type AppEntry } from "./content/apps";
import { Phone, Splash } from "./components/Phone";
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

export function App() {
  const desktop = useIsDesktop();
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
          <div className="size-full overflow-y-auto bg-background px-5 pb-16 pt-14 text-foreground">
            <DetailContent entry={entry} onClose={close} />
          </div>
        )}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="px-6 py-5 text-sm font-medium">Jon Willington</header>

      <main className="flex flex-1 items-center justify-center gap-16 px-6">
        <motion.div layout transition={{ type: "spring", stiffness: 200, damping: 26 }} className="flex flex-col items-center gap-5">
          <Tilt>
            <Phone framed open={open} onOpen={openEntry} onClose={close} renderOpen={(entry) => <Splash entry={entry} />} />
          </Tilt>
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

/** Leans the phone gently towards the cursor. */
function Tilt({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(x, [0, 1], [-6, 6]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(y, [0, 1], [5, -5]), { stiffness: 120, damping: 18 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX / window.innerWidth);
      y.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <div style={{ perspective: 1400 }}>
      <motion.div style={{ rotateX, rotateY }}>{children}</motion.div>
    </div>
  );
}
