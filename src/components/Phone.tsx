import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { ABOUT, APPS, type AppEntry } from "../content/apps";
import { AppIcon, IconArt } from "./AppIcon";

type Origin = { x: number; y: number };

type Props = {
  open: AppEntry | null;
  onOpen: (entry: AppEntry) => void;
  onClose: () => void;
  /** On phones the page itself is the screen: no frame, and the open app fills it. */
  framed: boolean;
  /** What to show inside an opened app. */
  renderOpen: (entry: AppEntry) => ReactNode;
};

export function Phone({ open, onOpen, onClose, framed, renderOpen }: Props) {
  const screenRef = useRef<HTMLDivElement>(null);
  // Opening from a link (no tap) zooms from the middle of the screen.
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [jiggle, setJiggle] = useState(false);

  const handleOpen = (entry: AppEntry, rect: DOMRect) => {
    if (jiggle) {
      setJiggle(false);
      return;
    }
    const screen = screenRef.current?.getBoundingClientRect();
    if (screen) {
      setOrigin({ x: rect.left + rect.width / 2 - screen.left, y: rect.top + rect.height / 2 - screen.top });
    }
    onOpen(entry);
  };

  const screen = (
    <div
      ref={screenRef}
      className={`wallpaper relative isolate flex size-full flex-col overflow-hidden ${framed ? "rounded-[46px]" : ""}`}
    >
      <StatusBar framed={framed} light={!open || framed} />

      <div className="flex flex-1 flex-col px-5 pt-3" onClick={(e) => e.target === e.currentTarget && setJiggle(false)}>
        <Widget onOpen={(rect) => handleOpen(ABOUT, rect)} />

        <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-5">
          {[ABOUT, ...APPS].map((entry, i) => (
            <AppIcon
              key={entry.id}
              entry={entry}
              index={i}
              jiggle={jiggle}
              onOpen={handleOpen}
              onLongPress={() => setJiggle(true)}
            />
          ))}
        </div>

        <div className="flex-1" onClick={() => setJiggle(false)} />

        <PageDots />
        <Dock />
      </div>

      <AnimatePresence>
        {jiggle && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onClick={() => setJiggle(false)}
            className="absolute right-4 top-12 z-10 cursor-pointer rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md"
          >
            Done
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key={open.id}
            className="absolute inset-0 z-20 overflow-hidden"
            style={{ transformOrigin: origin ? `${origin.x}px ${origin.y}px` : "50% 50%", background: framed ? open.accent : "var(--background)" }}
            initial={{ scale: 0.12, opacity: 0, borderRadius: 40 }}
            animate={{ scale: 1, opacity: 1, borderRadius: framed ? 46 : 0 }}
            exit={{ scale: 0.12, opacity: 0, borderRadius: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {renderOpen(open)}
            <HomeIndicator onClick={onClose} dark={!framed} />
          </motion.div>
        )}
      </AnimatePresence>

      {!open && <HomeIndicator onClick={() => setJiggle(false)} />}
    </div>
  );

  if (!framed) return <div className="h-dvh w-full">{screen}</div>;

  return (
    <div className="relative aspect-[9/19.5] h-[min(780px,calc(100dvh-170px))] rounded-[58px] bg-neutral-900 p-[11px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45),inset_0_0_0_2px_#3a3a3c]">
      {/* Side buttons */}
      <span className="absolute -left-[3px] top-[18%] h-8 w-[3px] rounded-l bg-neutral-800" />
      <span className="absolute -left-[3px] top-[25%] h-14 w-[3px] rounded-l bg-neutral-800" />
      <span className="absolute -left-[3px] top-[34%] h-14 w-[3px] rounded-l bg-neutral-800" />
      <span className="absolute -right-[3px] top-[28%] h-20 w-[3px] rounded-r bg-neutral-800" />
      {screen}
    </div>
  );
}

/** The "app" a framed phone shows when opened: a splash with the icon. */
export function Splash({ entry }: { entry: AppEntry }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-4 px-8 text-center text-white">
      <motion.div
        className="size-24 shadow-2xl"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 20 }}
      >
        <IconArt entry={entry} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-2xl font-semibold tracking-tight">{entry.name}</p>
        <p className="mt-1 text-sm text-white/70">{entry.tagline}</p>
      </motion.div>
    </div>
  );
}

function StatusBar({ framed, light }: { framed: boolean; light: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`relative z-30 flex h-12 shrink-0 items-center justify-between px-8 pt-1 text-[15px] font-semibold ${light ? "text-white" : "text-foreground"}`}
    >
      <span className="w-14 tabular-nums">{time}</span>
      {framed && <span className="absolute left-1/2 top-2.5 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />}
      <span className="flex w-14 items-center justify-end gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
          <path d="M7.5 2.2c2.1 0 4 .8 5.4 2.1l1.1-1.1A9.2 9.2 0 0 0 7.5.6 9.2 9.2 0 0 0 1 3.2l1.1 1.1a7.7 7.7 0 0 1 5.4-2.1Zm0 3.2c1.2 0 2.3.5 3.2 1.2l1.1-1.1a6.1 6.1 0 0 0-8.6 0l1.1 1.1c.9-.7 2-1.2 3.2-1.2Zm0 3.2c-.5 0-.9.2-1.1.5l1.1 1.1 1.1-1.1c-.2-.3-.6-.5-1.1-.5Z" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
          <path d="M23 4v4c.8-.3 1.3-1.1 1.3-2S23.8 4.3 23 4Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

function Widget({ onOpen }: { onOpen: (rect: DOMRect) => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}
      className="cursor-pointer rounded-[26px] bg-white/15 p-4 text-left text-white shadow-[0_6px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Currently</p>
      <p className="mt-1 text-[17px] font-semibold leading-snug">Group Product Design Manager</p>
      <p className="text-[15px] text-white/80">at Deel</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-white/60">On the side</p>
      <p className="text-[13px] text-white/90">{APPS.length} apps, designed and built by me</p>
    </motion.button>
  );
}

function PageDots() {
  return (
    <div className="mb-3 flex justify-center gap-1.5">
      <span className="size-1.5 rounded-full bg-white" />
      <span className="size-1.5 rounded-full bg-white/40" />
    </div>
  );
}

function Dock() {
  return (
    <div className="mb-7 flex justify-center gap-5 rounded-[30px] bg-white/20 px-4 py-3 backdrop-blur-xl">
      <DockLink href="mailto:hey@jonwill.ing" label="Email" className="bg-gradient-to-b from-sky-400 to-blue-600">
        <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="white" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </DockLink>
      <DockLink href="https://www.linkedin.com/in/jonathanwillington/" label="LinkedIn" className="bg-[#0a66c2]">
        <span className="text-[26px] font-bold leading-none tracking-tight text-white">in</span>
      </DockLink>
    </div>
  );
}

function DockLink({ href, label, className, children }: { href: string; label: string; className: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <motion.a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.88 }}
      className={`flex size-14 items-center justify-center rounded-[22%] shadow-[0_6px_16px_rgba(0,0,0,0.25)] ${className}`}
    >
      {children}
    </motion.a>
  );
}

function HomeIndicator({ onClick, dark = false }: { onClick: () => void; dark?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Go home"
      onClick={onClick}
      className="group absolute bottom-0 left-1/2 z-30 flex h-6 w-40 -translate-x-1/2 cursor-pointer items-center justify-center"
    >
      <span
        className={`h-[5px] w-32 rounded-full transition-transform group-hover:scale-x-110 ${dark ? "bg-foreground/80" : "bg-white/90"}`}
      />
    </button>
  );
}
