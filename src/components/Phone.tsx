import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { ABOUT, APPS, type AppEntry } from "../content/apps";
import { AppIcon, IconArt } from "./AppIcon";

// Apple's iPhone 17 bezel (public/device) is 1350×2760 at @3x, so the
// device is 450×920pt with the 402×874pt screen inset at (24, 23).
export const DEVICE = { width: 450, height: 920 };
const SCREEN = { left: 24, top: 23, width: 402, height: 874, radius: 63 };

// Home-screen metrics, measured from an iPhone 17 screenshot (points).
const GRID = { top: 89.3, left: 30.3, icon: 63.7, colPitch: 92.57, rowPitch: 100.33 };

const GLASS =
  "bg-white/20 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_0.5px_rgba(255,255,255,0.25)]";

type Origin = { x: number; y: number };

type Props = {
  open: AppEntry | null;
  onOpen: (entry: AppEntry) => void;
  onClose: () => void;
  /** Framed: the photoreal device at `scale`. Unframed (on phones): the page is the screen. */
  framed: boolean;
  scale?: number;
  /** What to show inside an opened app. */
  renderOpen: (entry: AppEntry) => ReactNode;
};

export function Phone({ open, onOpen, onClose, framed, scale = 1, renderOpen }: Props) {
  const screenRef = useRef<HTMLDivElement>(null);
  // Opening from a link (no tap) zooms from the middle of the screen.
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [jiggle, setJiggle] = useState(false);

  const handleOpen = (entry: AppEntry, rect: DOMRect) => {
    if (jiggle) {
      setJiggle(false);
      return;
    }
    const el = screenRef.current;
    if (el) {
      // The device is CSS-scaled, so convert viewport px back to screen points.
      const box = el.getBoundingClientRect();
      const k = box.width / el.offsetWidth;
      setOrigin({ x: (rect.left + rect.width / 2 - box.left) / k, y: (rect.top + rect.height / 2 - box.top) / k });
    }
    onOpen(entry);
  };

  const lightSplash = open?.scheme === "light";

  const screen = (
    <div
      ref={screenRef}
      className="wallpaper absolute isolate overflow-hidden"
      style={
        framed
          ? {
              left: SCREEN.left,
              top: SCREEN.top,
              width: SCREEN.width,
              height: SCREEN.height,
              borderRadius: SCREEN.radius,
            }
          : { inset: 0 }
      }
    >
      {framed && <StatusBar light={!lightSplash} />}

      <div
        className="relative flex h-full flex-col"
        style={{
          paddingTop: framed ? GRID.top : "max(16px, env(safe-area-inset-top))",
          paddingLeft: GRID.left - 4,
          paddingRight: GRID.left - 4,
        }}
        onClick={(e) => e.target === e.currentTarget && setJiggle(false)}
      >
        <MeWidget onOpen={(rect) => handleOpen(ABOUT, rect)} />

        {/* The widget fills two icon rows; apps start on row three. */}
        <div
          className="grid justify-between px-[4px]"
          style={{
            gridTemplateColumns: `repeat(4, ${GRID.icon}px)`,
            gridAutoRows: GRID.rowPitch,
          }}
        >
          {APPS.map((entry, i) => (
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
      </div>

      <SearchPill />
      <Dock framed={framed} />

      <AnimatePresence>
        {jiggle && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setJiggle(false)}
            className={`absolute right-[22px] z-10 cursor-pointer rounded-full px-[14px] py-[5px] text-[15px] font-semibold text-white ${GLASS} ${framed ? "top-[60px]" : "top-3"}`}
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
            style={{
              transformOrigin: origin ? `${origin.x}px ${origin.y}px` : "50% 50%",
              background: open.accent,
            }}
            initial={{ scale: 0.16, opacity: 0, borderRadius: 60 }}
            animate={{ scale: 1, opacity: 1, borderRadius: framed ? SCREEN.radius : 0 }}
            exit={{ scale: 0.16, opacity: 0, borderRadius: 60 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            {renderOpen(open)}
          </motion.div>
        )}
      </AnimatePresence>

      {framed && open && <HomeIndicator onClick={onClose} dark={lightSplash} />}
    </div>
  );

  if (!framed) return <div className="relative h-dvh w-full">{screen}</div>;

  return (
    <div className="relative" style={{ width: DEVICE.width * scale, height: DEVICE.height * scale }}>
      <div
        className="absolute left-0 top-0"
        style={{ width: DEVICE.width, height: DEVICE.height, transform: `scale(${scale})`, transformOrigin: "0 0" }}
      >
        {screen}
        <img
          src="/device/iphone-17-black.png"
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full select-none [filter:drop-shadow(0_40px_50px_rgba(0,0,0,0.28))_drop-shadow(0_8px_12px_rgba(0,0,0,0.18))]"
        />
      </div>
    </div>
  );
}

/** The "app" a framed phone shows when opened: a splash with the icon. */
export function Splash({ entry }: { entry: AppEntry }) {
  const light = entry.scheme === "light";
  const about = entry.id === "about";
  return (
    <div
      className={`flex size-full flex-col items-center justify-center gap-5 px-10 text-center ${light ? "text-neutral-900" : "text-white"}`}
    >
      <motion.div
        className={`size-[112px] shadow-2xl ${about ? "overflow-hidden rounded-full ring-4 ring-white" : "rounded-[25px]"}`}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 20 }}
      >
        <IconArt entry={entry} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-[28px] font-bold tracking-tight">{about ? "Jon Willington" : entry.name}</p>
        <p className={`mt-1 text-[16px] ${light ? "text-neutral-900/70" : "text-white/70"}`}>{entry.tagline}</p>
      </motion.div>
    </div>
  );
}

function useIstanbulTime() {
  const format = () =>
    new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", timeZone: "Europe/Istanbul" });
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 5_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

/** Sits either side of the Dynamic Island, which is part of the bezel image. */
function StatusBar({ light }: { light: boolean }) {
  const time = useIstanbulTime();

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-30 h-[54px] ${light ? "text-white" : "text-neutral-900"}`}
    >
      <span className="absolute left-0 top-[21px] w-[139px] text-center text-[17px] font-semibold leading-[22px] tracking-[-0.4px] tabular-nums">
        {time}
      </span>
      <span className="absolute left-[263px] top-[21px] flex h-[22px] w-[139px] items-center justify-center gap-[6px]">
        <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor" aria-hidden>
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
          <rect x="5.2" y="5" width="3.2" height="7" rx="1" />
          <rect x="10.4" y="2.5" width="3.2" height="9.5" rx="1" />
          <rect x="15.6" y="0" width="3.2" height="12" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
          <path d="M8.5 2.3c2.4 0 4.6.9 6.2 2.5l1.2-1.2A10.4 10.4 0 0 0 8.5.6 10.4 10.4 0 0 0 1.1 3.6l1.2 1.2a8.7 8.7 0 0 1 6.2-2.5Zm0 3.5c1.4 0 2.7.5 3.7 1.4l1.2-1.2a6.9 6.9 0 0 0-9.8 0l1.2 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.5c-.5 0-1 .2-1.3.6l1.3 1.3 1.3-1.3c-.3-.4-.8-.6-1.3-.6Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="23" height="12" rx="4" stroke="currentColor" opacity="0.35" />
          <rect x="2" y="2" width="17" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

/**
 * The "me" entry: a medium Maps-style widget with my photo pinned over
 * Istanbul. The map is a static render (public/istanbul-map.jpg).
 */
const WIDGET_HEIGHT = 164;

function MeWidget({ onOpen }: { onOpen: (rect: DOMRect) => void }) {
  return (
    <div className="flex shrink-0 flex-col items-center" style={{ height: 2 * GRID.rowPitch }}>
      <motion.button
        type="button"
        aria-label="Jon Willington, currently in Istanbul"
        whileTap={{ scale: 0.96 }}
        onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}
        className="relative w-full cursor-pointer overflow-hidden rounded-[26px] text-left shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        style={{ height: WIDGET_HEIGHT }}
      >
        <img src="/istanbul-map.jpg" alt="" draggable={false} className="absolute inset-0 size-full object-cover" />

        {/* Photo pin over Beyoğlu, Find My style */}
        <span className="absolute left-[37%] top-[44%] -translate-x-1/2 -translate-y-full">
          <span className="location-pulse absolute bottom-[-12px] left-1/2 size-[44px] -translate-x-1/2 rounded-full bg-[#0a84ff]/25" />
          <span className="relative block size-[50px] overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
            <img src="/me.jpg" alt="" draggable={false} className="size-full object-cover" />
          </span>
          <span className="relative mx-auto -mt-[3px] block size-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]" />
        </span>

        <span className="absolute inset-x-0 bottom-0 h-[78px] bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-[12px] left-[14px] text-white">
          <span className="block text-[20px] font-bold leading-tight tracking-[-0.4px]">Jon Willington</span>
          <span className="flex items-center gap-[5px] text-[13px] font-medium text-white/85">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M21.7 2.3a1 1 0 0 0-1.1-.2L2.9 9.8a1 1 0 0 0 .1 1.9l7.6 1.7 1.7 7.6a1 1 0 0 0 1.9.1l7.7-17.7a1 1 0 0 0-.2-1.1Z" />
            </svg>
            Currently in Istanbul
          </span>
        </span>
        <span className="absolute bottom-[6px] right-[10px] text-[7px] text-white/70">© OpenStreetMap</span>
      </motion.button>
      <span className="mt-[6.5px] text-[12px] font-medium leading-[14px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
        Find My
      </span>
    </div>
  );
}

function SearchPill() {
  return (
    <div
      className={`pointer-events-none absolute bottom-[141px] left-1/2 flex h-[28.5px] w-[78px] -translate-x-1/2 items-center justify-center gap-[5px] rounded-full text-[15px] text-white ${GLASS}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden>
        <circle cx="10.5" cy="10.5" r="7" />
        <path d="m16 16 5.5 5.5" strokeLinecap="round" />
      </svg>
      Search
    </div>
  );
}

function Dock({ framed }: { framed: boolean }) {
  return (
    <div
      className={`absolute inset-x-[17px] flex h-[101.5px] items-center justify-center gap-[23.7px] rounded-[44px] ${GLASS} ${framed ? "bottom-[18px]" : "bottom-[max(18px,env(safe-area-inset-bottom))]"}`}
    >
      <DockLink href="mailto:hey@jonwill.ing" label="Email" className="bg-gradient-to-b from-[#1fb0ff] to-[#0a6cf0]">
        <svg viewBox="0 0 24 24" className="size-[38px]" fill="white" aria-hidden>
          <path d="M3.5 6.2A2.2 2.2 0 0 1 5.7 4h12.6a2.2 2.2 0 0 1 2.2 2.2v.3l-8.5 5.6-8.5-5.6v-.3Z" />
          <path d="M3.5 8.3v9.5A2.2 2.2 0 0 0 5.7 20h12.6a2.2 2.2 0 0 0 2.2-2.2V8.3l-8 5.3a.9.9 0 0 1-1 0l-8-5.3Z" />
        </svg>
      </DockLink>
      <DockLink href="https://www.linkedin.com/in/jonathanwillington/" label="LinkedIn" className="bg-[#0a66c2]">
        <span className="text-[34px] font-bold leading-none tracking-[-1px] text-white">in</span>
      </DockLink>
    </div>
  );
}

function DockLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <motion.a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      whileTap={{ scale: 0.88 }}
      className={`flex size-[63.7px] items-center justify-center rounded-[22.5%] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.25)] ${className}`}
    >
      {children}
    </motion.a>
  );
}

function HomeIndicator({ onClick, dark }: { onClick: () => void; dark: boolean }) {
  return (
    <button
      type="button"
      aria-label="Go home"
      onClick={onClick}
      className="group absolute bottom-0 left-1/2 z-30 flex h-[22px] w-[180px] -translate-x-1/2 cursor-pointer items-start justify-center"
    >
      <span
        className={`mt-[8px] h-[5px] w-[139px] rounded-full transition-transform group-hover:scale-x-110 ${dark ? "bg-neutral-900" : "bg-white"}`}
      />
    </button>
  );
}
