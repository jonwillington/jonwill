import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";

import { APPS, type AppEntry } from "../../content/apps";
import { formatGbp, type Live } from "../../lib/live";
import { Squircle } from "../../lib/squircle";
import { formatLockDate, formatTime, timeAgo, useNow } from "../../lib/time";
import { IconArt } from "../AppIcon";
import { GLASS, GLASS_EDGE, SCREEN } from "./constants";
import { SITE } from "../../content/site";
import { track } from "../../lib/analytics";

type Note = { entry: AppEntry; title: string; body: string; when: string };

// Notifications come from particular apps; one that isn't on this phone is skipped.
const byId = (id: string) => APPS.find((a) => a.id === id) as AppEntry;

function notifications(live: Live | null, now: Date): Note[] {
  const notes: Note[] = [];
  const d = live?.ddbx;
  notes.push(
    d
      ? {
          entry: byId("ddbx"),
          title: `${d.rating === "significant" ? "Significant" : "Noteworthy"} buy: ${d.company}`,
          body: `${d.role} bought ${formatGbp(d.valueGbp)} of shares.`,
          when: timeAgo(d.at, now),
        }
      : {
          entry: byId("ddbx"),
          title: "New director dealing",
          body: "A director just bought shares. Tap to see how it rates.",
          when: "now",
        },
  );
  const ib = live?.istanbrew;
  notes.push(
    ib
      ? {
          entry: byId("istanbrew"),
          title: `${ib.openNow} coffee shops open now`,
          body: ib.pick
            ? `${ib.pick.name}${ib.pick.area ? ` in ${ib.pick.area}` : ""} is a good place to start.`
            : "Find one near you.",
          when: "now",
        }
      : {
          entry: byId("istanbrew"),
          title: "Coffee time",
          body: "Every speciality coffee shop in Istanbul, on one map.",
          when: "now",
        },
  );
  notes.push({
    entry: byId("ga-bridge"),
    title: SITE.domain,
    body: "1 person on the site right now. That's you.",
    when: "now",
  });
  return notes.filter((n) => n.entry);
}

/**
 * The lock screen visitors start on. Swipe (or drag) up, click, or press
 * Enter to unlock; tapping a notification unlocks straight into that app.
 */
export function LockScreen({
  live,
  framed,
  onUnlock,
}: {
  live: Live | null;
  framed: boolean;
  onUnlock: (open?: AppEntry, from?: DOMRect, method?: string) => void;
}) {
  const now = useNow();
  const y = useMotionValue(0);
  // The clock and notifications ride up faster than the drag and fade, like iOS.
  const contentOpacity = useTransform(y, [0, -260], [1, 0]);
  const contentScale = useTransform(y, [0, -260], [1, 0.94]);
  const [torch, setTorch] = useState(false);
  const leaving = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const notes = notifications(live, now);

  const unlock = (method = "swipe") => {
    if (leaving.current) return;
    leaving.current = true;
    animate(y, -SCREEN.height, { type: "spring", stiffness: 260, damping: 32, velocity: -1200 }).then(() =>
      onUnlock(undefined, undefined, method),
    );
  };

  // A notification opens its app straight away, as on iOS: no slide up, no home screen.
  // The lock screen fades (its exit, in Phone) while the app grows out of the notification.
  const openFrom = (entry: AppEntry, rect: DOMRect) => {
    if (leaving.current) return;
    leaving.current = true;
    onUnlock(entry, rect);
  };

  useEffect(() => {
    root.current?.focus({ preventScroll: true });
  }, []);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -110 || info.velocity.y < -500) unlock("swipe");
    else animate(y, 0, { type: "spring", stiffness: 400, damping: 34 });
  };

  return (
    <motion.div
      ref={root}
      tabIndex={-1}
      role="dialog"
      aria-label="Lock screen. Press Enter or swipe up to unlock."
      className="absolute inset-0 z-[48] cursor-grab touch-none select-none overflow-hidden outline-none active:cursor-grabbing"
      exit={{ opacity: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } }}
      style={{ y }}
      drag="y"
      dragConstraints={{ top: -SCREEN.height, bottom: 0 }}
      dragElastic={{ top: 0.05, bottom: 0 }}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") {
          e.preventDefault();
          unlock("keyboard");
        }
      }}
      onTap={(e) => {
        // A plain click anywhere that isn't a control also unlocks.
        if (!(e.target as HTMLElement).closest("button")) unlock("click");
      }}
    >
      <div className="wallpaper-layer absolute inset-0" />
      <div className="absolute inset-0 bg-black/10" />

      <motion.div
        className="relative flex h-full flex-col items-center"
        style={{ opacity: contentOpacity, scale: contentScale }}
      >
        {/* Lock glyph, date and the big clock */}
        <div
          className={`flex flex-col items-center text-white ${framed ? "pt-[60px]" : "pt-[max(48px,env(safe-area-inset-top))]"}`}
        >
          <svg width="13" height="17" viewBox="0 0 13 17" fill="currentColor" className="opacity-90" aria-hidden>
            <path d="M6.5 0A4.5 4.5 0 0 0 2 4.5V7h-.5A1.5 1.5 0 0 0 0 8.5v7A1.5 1.5 0 0 0 1.5 17h10a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 7H11V4.5A4.5 4.5 0 0 0 6.5 0Zm3 7h-6V4.5a3 3 0 0 1 6 0V7Z" />
          </svg>
          <p className="mt-[10px] text-[20px] font-semibold tracking-[-0.3px] opacity-90 [text-shadow:0_1px_8px_rgba(0,0,0,0.15)]">
            {formatLockDate(now)}
          </p>
          <p className="lock-clock -mt-[2px] text-[104px] font-bold leading-[1] tracking-[-3px] tabular-nums">
            {formatTime(now)}
          </p>
        </div>

        {/* Notifications, arriving one at a time */}
        <div className="mt-auto flex w-full flex-col gap-[8px] px-[12px] pb-[150px]">
          {notes.map((n, i) => (
            <motion.button
              key={n.entry.id}
              type="button"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.45, type: "spring", stiffness: 320, damping: 26 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => openFrom(n.entry, e.currentTarget.getBoundingClientRect())}
              className="relative w-full cursor-pointer text-left"
            >
              <Squircle
                radius={24}
                smoothing={0.6}
                rim
                glass="bg-[rgba(246,246,248,0.62)] backdrop-blur-[24px] backdrop-saturate-[1.8]"
                className="relative"
              >
                <span className="relative flex gap-[10px] px-[14px] py-[12px] text-black">
                  <span className="mt-[2px] size-[38px] shrink-0">
                    <IconArt entry={n.entry} size={38} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[15px] font-semibold tracking-[-0.3px]">{n.title}</span>
                      <span className="shrink-0 text-[13px] text-black/45">{n.when}</span>
                    </span>
                    <span className="line-clamp-2 text-[15px] leading-[19px] tracking-[-0.2px] text-black/80">
                      {n.body}
                    </span>
                  </span>
                </span>
              </Squircle>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Flashlight and camera, and the hint */}
      <motion.div className="absolute inset-x-0 bottom-0" style={{ opacity: contentOpacity }}>
        <div className="flex items-center justify-between px-[46px] pb-[46px]">
          <QuickButton
            label={torch ? "Turn flashlight off" : "Turn flashlight on"}
            active={torch}
            onPress={() => {
              track("lock_screen_control", { control: "flashlight", on: !torch });
              setTorch((t) => !t);
            }}
          >
            <svg width="16" height="24" viewBox="0 0 16 24" fill="currentColor" aria-hidden>
              <path d="M2 0h12a1 1 0 0 1 1 1v4c0 1.5-1 3-2.2 4.4L12 10.5V23a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5l-.8-1.1C2 8 1 6.5 1 5V1a1 1 0 0 1 1-1Zm6 13a1.5 1.5 0 0 0-1.5 1.5v2a1.5 1.5 0 0 0 3 0v-2A1.5 1.5 0 0 0 8 13Z" />
            </svg>
          </QuickButton>
          <span className="lock-hint text-[15px] font-medium tracking-[-0.2px]">Swipe up to open</span>
          <QuickButton label="Camera" onPress={() => track("lock_screen_control", { control: "camera" })}>
            <svg width="24" height="19" viewBox="0 0 24 19" fill="currentColor" aria-hidden>
              <path d="M8.5 0h7l1.6 2.5H21a3 3 0 0 1 3 3V16a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5.5a3 3 0 0 1 3-3h3.9L8.5 0ZM12 5.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
            </svg>
          </QuickButton>
        </div>
        {framed && (
          <div className="absolute bottom-[8px] left-1/2 h-[5px] w-[139px] -translate-x-1/2 rounded-full bg-white" />
        )}
      </motion.div>

      {/* The torch lights up the screen a little; a nod, not a real flashlight. */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_100%,rgba(255,255,240,0.45),transparent_60%)]"
        animate={{ opacity: torch ? 1 : 0 }}
      />
    </motion.div>
  );
}

function QuickButton({
  label,
  active = false,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={active}
      whileTap={{ scale: 1.18 }}
      onClick={onPress}
      className={`flex size-[50px] cursor-pointer items-center justify-center rounded-full transition-colors ${active ? "bg-white text-black" : `${GLASS} ${GLASS_EDGE} text-white`}`}
    >
      {children}
    </motion.button>
  );
}
