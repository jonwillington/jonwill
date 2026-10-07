import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, useMotionValue, useTransform, type PanInfo } from "motion/react";

import { ABOUT, APPS, INTERESTS, SHOW_INTERESTS, type AppEntry } from "../content/apps";
import { track } from "../lib/analytics";
import type { Live } from "../lib/live";
import { AppIcon } from "./AppIcon";
import { InterestsWidget } from "./InterestsWidget";
import { ContextMenu, type MenuAction, type MenuAnchor } from "./phone/ContextMenu";
import { DEVICE, GLASS, GLASS_EDGE, GRID, SCREEN, WIDGET } from "./phone/constants";
import { DOCK_ICONS, Dock, SearchPill, type DockId } from "./phone/Dock";
import { DynamicIsland } from "./phone/DynamicIsland";
import { DdbxWidget, IstanbrewWidget, MeWidget } from "./phone/HomeWidgets";
import { IOSAlert, type AlertAction } from "./phone/IOSAlert";
import { LockScreen } from "./phone/LockScreen";
import { Spotlight } from "./phone/Spotlight";
import { StatusBar } from "./phone/StatusBar";
import { SITE } from "../content/site";

export { DEVICE };

type Origin = { x: number; y: number };
type Alert = { title: string; message: string; actions: AlertAction[] };

type Props = {
  open: AppEntry | null;
  /** Apps this visitor has opened; the rest show a "1" badge. */
  seen: ReadonlySet<string>;
  live: Live | null;
  dark: boolean;
  /** `source` says how it was opened, for analytics (icon, widget, notification, spotlight…). */
  onOpen: (entry: AppEntry, source: string) => void;
  onClose: () => void;
  /** Framed: the photoreal device at `scale`. Unframed (on phones): the page is the screen. */
  framed: boolean;
  scale?: number;
  /** What to show inside an opened app. */
  renderOpen: (entry: AppEntry) => ReactNode;
  /** Told when the lock screen is dismissed (or isn't shown at all). */
  onLockedChange?: (locked: boolean) => void;
  /** Whether the opened app draws its own status bar (real screenshots do). */
  ownStatusBar: boolean;
  /** Whether the opened app is light, so the home indicator and status bar go dark. */
  lightApp: boolean;
};

/** The ddbx and Istanbrew home-screen widgets are built but hidden for now. */
const SHOW_LIVE_WIDGETS = false;

const ORDER_KEY = "jonwill:order";
const UNLOCKED_KEY = "jonwill:unlocked";
const ACTIVITY_KEY = "jonwill:activity";
const TEMPLATE_KEY = "jonwill:template-offer";

const storage = {
  get(store: Storage, key: string) {
    try {
      return store.getItem(key);
    } catch {
      return null;
    }
  },
  set(store: Storage, key: string, value: string) {
    try {
      store.setItem(key, value);
    } catch {
      // Blocked storage: the setting just isn't remembered.
    }
  },
};

/** The visitor's icon order, falling back to the content order for new or unknown apps. */
function initialOrder() {
  const ids = APPS.map((a) => a.id);
  try {
    const saved = JSON.parse(storage.get(localStorage, ORDER_KEY) ?? "[]") as string[];
    const order = saved.filter((id) => ids.includes(id));
    // A new app goes next to its neighbour in the content order (so ddbx.us lands beside
    // ddbx.uk), not on the end of a visitor's saved arrangement.
    ids.forEach((id, i) => {
      if (order.includes(id)) return;
      const before = ids
        .slice(0, i)
        .reverse()
        .find((x) => order.includes(x));
      order.splice(before ? order.indexOf(before) + 1 : 0, 0, id);
    });
    return order;
  } catch {
    return ids;
  }
}

export function Phone({
  open,
  seen,
  live,
  dark,
  onOpen,
  onClose,
  framed,
  scale = 1,
  renderOpen,
  ownStatusBar,
  lightApp,
  onLockedChange,
}: Props) {
  const screenRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // Opening from a link (no tap) zooms from the middle of the screen.
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [editing, setEditing] = useState(false);
  const [order, setOrder] = useState(initialOrder);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ entry: AppEntry; anchor: MenuAnchor; actions?: MenuAction[] } | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [spotlight, setSpotlight] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Deep links skip the lock screen; otherwise once per browser session.
  const [locked, setLocked] = useState(
    () => !window.location.hash && storage.get(sessionStorage, UNLOCKED_KEY) !== "1",
  );
  const [unlockCount, setUnlockCount] = useState(0);
  // Opening an app from a notification goes lock screen → app with no home screen in between
  // (as on iOS). The home screen stays hidden until you leave that app.
  const [homeHidden, setHomeHidden] = useState(false);
  useEffect(() => {
    if (!open) setHomeHidden(false);
  }, [open]);
  useEffect(() => onLockedChange?.(locked), [locked, onLockedChange]);
  const [activity, setActivity] = useState(false);

  const apps = order.map((id) => APPS.find((a) => a.id === id)!);

  /** Viewport px → screen points (the framed device is CSS-scaled). */
  const toScreen = useCallback((x: number, y: number) => {
    const el = screenRef.current;
    if (!el) return { x, y, k: 1 };
    const box = el.getBoundingClientRect();
    const k = box.width / el.offsetWidth;
    return { x: (x - box.left) / k, y: (y - box.top) / k, k };
  }, []);

  const showToast = useCallback((text: string) => setToast(text), []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  /** Shows an iOS alert and tags it, and whichever button the visitor presses. */
  const showAlert = (name: string, a: Alert) => {
    track("alert_shown", { alert: name });
    setAlert({
      ...a,
      actions: a.actions.map((x) => ({
        ...x,
        onPress: () => {
          track("alert_action", { alert: name, action: x.label });
          x.onPress?.();
        },
      })),
    });
  };

  const handleOpen = (entry: AppEntry, rect?: DOMRect, source = "icon") => {
    if (editing) {
      setEditing(false);
      return;
    }
    setOrigin(rect ? toScreen(rect.left + rect.width / 2, rect.top + rect.height / 2) : null);
    onOpen(entry, source);
  };

  const copy = async (text: string, done: string) => {
    track("copy", { what: done.replace(/ copied$/i, "").toLowerCase() });
    try {
      await navigator.clipboard.writeText(text);
      showToast(done);
    } catch {
      // Clipboard blocked; nothing to do.
    }
  };
  const openUrl = (url: string) => window.open(url, url.startsWith("http") ? "_blank" : "_self", "noopener");

  const showWhatsApp = () =>
    showAlert("whatsapp", {
      title: SITE.whatsapp!.title,
      message: SITE.whatsapp!.message,
      actions: [{ label: "OK" }, { label: "Email me", primary: true, href: `mailto:${SITE.email}` }],
    });

  // Dock icons get menus too: each one's own quick actions, then Edit Home Screen / Remove App.
  const dockActions = (id: DockId): MenuAction[] => {
    switch (id) {
      case "mail":
        return [
          { label: "New Message", glyph: "compose", onPress: () => openUrl(`mailto:${SITE.email}`) },
          { label: "Copy Address", glyph: "copy", onPress: () => copy(SITE.email, "Email address copied") },
        ];
      case "linkedin":
        return [
          { label: "View Profile", glyph: "person", onPress: () => openUrl(SITE.linkedin.url) },
          { label: "Copy Link", glyph: "copy", onPress: () => copy(SITE.linkedin.url, "Link copied") },
        ];
      case "whatsapp":
        return [
          { label: "New Chat", glyph: "chat", onPress: showWhatsApp },
          { label: "Email Instead", glyph: "mail", onPress: () => openUrl(`mailto:${SITE.email}`) },
        ];
      case "github":
        return [
          { label: "View the Code", glyph: "code", onPress: () => openUrl(SITE.github!) },
          { label: "Star on GitHub", glyph: "star", onPress: () => openUrl(SITE.github!) },
          { label: "Copy Link", glyph: "copy", onPress: () => copy(SITE.github!, "Link copied") },
        ];
    }
  };

  const openDockMenu = (id: DockId, rect: DOMRect) => {
    track("context_menu_open", { target: `dock-${id}` });
    const a = toScreen(rect.left, rect.top);
    const { label, icon } = DOCK_ICONS[id];
    // A minimal entry so the menu can draw the lifted icon and name it.
    const entry = {
      id: `dock-${id}`,
      name: label,
      icon,
      accent: "#000",
      tagline: "",
      tags: [],
      body: [],
      links: [],
    } as AppEntry;
    setMenu({
      entry,
      actions: dockActions(id),
      anchor: { x: a.x, y: a.y, width: rect.width / a.k, height: rect.height / a.k },
    });
  };

  const openMenu = (entry: AppEntry, rect: DOMRect) => {
    track("context_menu_open", { target: entry.id });
    const a = toScreen(rect.left, rect.top);
    setMenu({ entry, anchor: { x: a.x, y: a.y, width: rect.width / a.k, height: rect.height / a.k } });
  };

  const share = async (entry: AppEntry) => {
    track("share", { app: entry.id, method: "share" in navigator ? "share_sheet" : "copy_link" });
    const url = `${window.location.origin}/ton#${entry.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${entry.name} by ${SITE.name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      // Share sheet dismissed.
    }
  };

  const askRemove = (entry: AppEntry) =>
    showAlert(`remove_${entry.id}`, {
      title: `Remove “${entry.name}”?`,
      message: "You can't, sorry. I spent far too long on it.",
      actions: [
        { label: "Remove", destructive: true, onPress: () => showToast("Nice try. It's staying.") },
        { label: "Keep It", primary: true },
      ],
    });

  // Drag to rearrange: work out which slot the pointer is over and move the app there.
  const onDragMove = (entry: AppEntry, point: { x: number; y: number }) => {
    const grid = gridRef.current;
    if (!grid) return;
    const box = grid.getBoundingClientRect();
    const k = box.width / grid.offsetWidth;
    const x = (point.x - box.left) / k;
    const y = (point.y - box.top) / k;
    const rows = Math.ceil(apps.length / 4);
    const col = Math.max(0, Math.min(3, Math.round((x - 4 - GRID.icon / 2) / GRID.colPitch)));
    const row = Math.max(0, Math.min(rows - 1, Math.floor(y / GRID.rowPitch)));
    const target = Math.min(apps.length - 1, row * 4 + col);
    const from = order.indexOf(entry.id);
    if (target !== from) {
      const next = order.filter((id) => id !== entry.id);
      next.splice(target, 0, entry.id);
      setOrder(next);
    }
  };
  const onDragEnd = () => {
    if (draggingId) track("icon_reorder", { app: draggingId, position: order.indexOf(draggingId) + 1 });
    setDraggingId(null);
    storage.set(localStorage, ORDER_KEY, JSON.stringify(order));
  };

  // Hold an empty part of the home screen to start editing, as on iOS.
  const emptyPress = useRef<number | undefined>(undefined);
  const onHomePointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget) return;
    emptyPress.current = window.setTimeout(() => {
      track("edit_mode", { source: "home_hold" });
      setEditing(true);
    }, 600);
  };
  const cancelEmptyPress = () => window.clearTimeout(emptyPress.current);

  const unlock = (into?: AppEntry, from?: DOMRect, method = "swipe") => {
    track("unlock", { method: into ? "notification" : method, app: into?.id });
    storage.set(sessionStorage, UNLOCKED_KEY, "1");
    setLocked(false);
    if (into) {
      setHomeHidden(true);
      // Straight into the app, growing from the notification, in the same frame the lock
      // screen starts to fade, so the page settles in one move rather than home-then-app.
      handleOpen(into, from, "notification");
    } else {
      // Swiped up: the home screen's icons fly in.
      setUnlockCount((n) => n + 1);
    }
  };

  // The brew-timer Live Activity: once per session, a few seconds after reaching the home screen.
  useEffect(() => {
    if (!framed || locked || open || storage.get(sessionStorage, ACTIVITY_KEY)) return;
    const id = window.setTimeout(() => {
      storage.set(sessionStorage, ACTIVITY_KEY, "1");
      track("live_activity_shown");
      setActivity(true);
    }, 5000);
    return () => window.clearTimeout(id);
  }, [framed, locked, open]);

  // Once a visitor has opened an app and come back home, offer them the template. Once ever.
  useEffect(() => {
    if (!SITE.github || locked || open || menu || alert || spotlight || seen.size === 0) return;
    if (storage.get(localStorage, TEMPLATE_KEY)) return;
    const id = window.setTimeout(() => {
      storage.set(localStorage, TEMPLATE_KEY, "1");
      showAlert("template_offer", {
        title: "Want a phone like this?",
        message: "This whole site is a free template. Grab it from my GitHub and make it yours.",
        actions: [{ label: "Not now" }, { label: "Get it", primary: true, href: SITE.github! }],
      });
    }, 1400);
    return () => window.clearTimeout(id);
  }, [locked, open, menu, alert, spotlight, seen.size]);

  // Keyboard: ⌘K / "/" for Spotlight, ⌘Z for an "Undo Typing" joke.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea");
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        if (locked) return;
        e.preventDefault();
        track("spotlight_open", { trigger: e.key === "/" ? "slash" : "cmd_k" });
        setSpotlight(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        undoTyping("keyboard");
      } else if (e.key === "Escape" && editing) {
        setEditing(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Shake to undo, where the browser allows motion events without asking.
  useEffect(() => {
    let last = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const force = Math.abs(a.x ?? 0) + Math.abs(a.y ?? 0) + Math.abs(a.z ?? 0);
      if (force > 38 && Date.now() - last > 2000) {
        last = Date.now();
        undoTyping("shake");
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  });

  const undoTyping = (trigger = "keyboard") => {
    track("undo_typing", { trigger });
    showAlert("undo_typing", {
      title: "Undo Typing",
      message: "There's nothing to undo. Everything on this phone is here on purpose.",
      actions: [{ label: "Cancel" }, { label: "Undo", primary: true, onPress: () => showToast("Nothing to undo") }],
    });
  };

  // Swipe up from the home indicator to close an app, as on iOS.
  const dragControls = useDragControls();
  const appY = useMotionValue(0);
  const appScale = useTransform(appY, [0, -320], [1, 0.62]);
  const appRadius = useTransform(appY, [0, -60], [framed ? SCREEN.radius : 0, 44]);
  const onAppDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -70 || info.velocity.y < -400) {
      track("app_close_gesture", { app: open?.id, method: "swipe_up" });
      onClose();
    }
  };
  useEffect(() => appY.set(0), [open, appY]);

  const statusLight = open ? !(ownStatusBar ? lightApp : open.scheme === "light") : true;

  const screen = (
    <div
      ref={screenRef}
      data-night={dark ? "true" : "false"}
      className="absolute isolate select-none overflow-hidden"
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
      <div className="wallpaper-layer absolute inset-0" />

      {framed && (!open || !ownStatusBar) && <StatusBar light={locked || statusLight} activity={activity} />}

      {/* The home screen. Re-keyed on unlock so the icons fly in like iOS. */}
      <motion.div
        key={unlockCount}
        className={`relative flex h-full flex-col ${homeHidden ? "invisible" : ""}`}
        initial={unlockCount ? { scale: 1.12, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        style={{
          paddingTop: framed ? GRID.top : "max(16px, env(safe-area-inset-top))",
          paddingLeft: GRID.left - 4,
          paddingRight: GRID.left - 4,
        }}
        onPointerDown={onHomePointerDown}
        onPointerUp={cancelEmptyPress}
        onPointerLeave={cancelEmptyPress}
        onClick={(e) => e.target === e.currentTarget && setEditing(false)}
      >
        <MeWidget dark={dark} onOpen={(rect) => handleOpen(ABOUT, rect, "widget")} />

        {/* The Find My widget fills two icon rows; apps start on row three. */}
        <div
          ref={gridRef}
          className="grid justify-between px-[4px]"
          style={{ gridTemplateColumns: `repeat(4, ${GRID.icon}px)`, gridAutoRows: GRID.rowPitch }}
        >
          {apps.map((entry, i) => (
            <AppIcon
              key={entry.id}
              entry={entry}
              index={i}
              editing={editing}
              dragging={draggingId === entry.id}
              badge={!seen.has(entry.id)}
              onOpen={handleOpen}
              onMenu={openMenu}
              onRemove={askRemove}
              onDragStart={(e) => setDraggingId(e.id)}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>

        {/* Rows five and six: the live widgets or the interests widget, both switched off for now. */}
        {SHOW_LIVE_WIDGETS && (
          <div className="flex justify-between">
            <DdbxWidget
              live={live?.ddbx}
              onOpen={(rect) =>
                handleOpen(
                  APPS.find((a) => a.id === "ddbx")!,
                  rect,
                  "widget",
                )
              }
            />
            <IstanbrewWidget
              live={live?.istanbrew}
              onOpen={(rect) =>
                handleOpen(
                  APPS.find((a) => a.id === "istanbrew")!,
                  rect,
                  "widget",
                )
              }
            />
          </div>
        )}
        {SHOW_INTERESTS && (
          <div className="flex shrink-0 flex-col items-center" style={{ height: 2 * GRID.rowPitch }}>
            <InterestsWidget height={WIDGET.medium.height} onOpen={(rect) => handleOpen(INTERESTS, rect)} />
          </div>
        )}
      </motion.div>

      {/* Hidden instantly (not faded) on the notification path, so it never flashes up. */}
      <div className={homeHidden ? "invisible" : undefined} style={{ display: "contents" }}>
        <SearchPill
          onPress={() => {
            track("spotlight_open", { trigger: "search_pill" });
            setSpotlight(true);
          }}
          hidden={spotlight}
        />
        <Dock framed={framed} hidden={spotlight} onWhatsApp={showWhatsApp} onMenu={openDockMenu} />
      </div>

      <AnimatePresence>
        {editing && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setEditing(false)}
            className={`absolute right-[22px] z-30 cursor-pointer rounded-full px-[14px] py-[5px] text-[15px] font-semibold text-white ${GLASS} ${GLASS_EDGE} ${framed ? "top-[60px]" : "top-3"}`}
          >
            Done
          </motion.button>
        )}
      </AnimatePresence>

      {/* The open app: zooms out of its icon; swipe up from the bottom to close. */}
      <AnimatePresence>
        {open && (
          <motion.div
            key={open.id}
            className="absolute inset-0 z-20"
            style={{ transformOrigin: origin ? `${origin.x}px ${origin.y}px` : "50% 50%" }}
            initial={{ scale: 0.16, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <motion.div
              className="absolute inset-0 overflow-hidden"
              style={{ y: appY, scale: appScale, borderRadius: appRadius, background: open.accent }}
              drag={framed ? "y" : false}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: -SCREEN.height, bottom: 0 }}
              dragElastic={{ top: 0.6, bottom: 0 }}
              dragSnapToOrigin
              onDragEnd={onAppDragEnd}
            >
              {renderOpen(open)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {framed && open && (
        <HomeIndicator dark={lightApp} onClick={onClose} onPointerDown={(e) => dragControls.start(e)} />
      )}

      <AnimatePresence>
        {spotlight && (
          <Spotlight
            onClose={() => setSpotlight(false)}
            onOpenEntry={(e) => window.setTimeout(() => handleOpen(e, undefined, "spotlight"), 200)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menu && (
          <ContextMenu
            entry={menu.entry}
            anchor={menu.anchor}
            actions={menu.actions}
            onClose={() => setMenu(null)}
            onShare={() => share(menu.entry)}
            onEdit={() => {
              track("edit_mode", { source: "context_menu" });
              setEditing(true);
            }}
            onRemove={() => askRemove(menu.entry)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alert && (
          <IOSAlert
            title={alert.title}
            message={alert.message}
            actions={alert.actions}
            onClose={() => setAlert(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className={`absolute left-1/2 top-[62px] z-[70] -translate-x-1/2 whitespace-nowrap rounded-full px-[16px] py-[8px] text-[15px] font-semibold text-white ${GLASS} ${GLASS_EDGE}`}
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{locked && <LockScreen live={live} framed={framed} onUnlock={unlock} />}</AnimatePresence>

      <AnimatePresence>
        {activity && framed && (
          <DynamicIsland
            onOpenIstanbrew={() => {
              track("live_activity_tap", { action: "open_istanbrew" });
              handleOpen(
                APPS.find((a) => a.id === "istanbrew")!,
                undefined,
                "live_activity",
              );
            }}
            onFinished={() => setActivity(false)}
          />
        )}
      </AnimatePresence>
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
          className="pointer-events-none absolute inset-0 size-full select-none transition-[filter] duration-700"
          // Softer when an app is open: the page is coloured and a heavy shadow muddies it.
          style={{
            filter: open
              ? "drop-shadow(0 24px 40px rgba(0,0,0,0.10)) drop-shadow(0 2px 6px rgba(0,0,0,0.06))"
              : "drop-shadow(0 32px 48px rgba(0,0,0,0.20)) drop-shadow(0 6px 10px rgba(0,0,0,0.12))",
          }}
        />
      </div>
    </div>
  );
}

function HomeIndicator({
  onClick,
  onPointerDown,
  dark,
}: {
  onClick: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  dark: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="Go home (or swipe up)"
      onClick={onClick}
      onPointerDown={onPointerDown}
      className="group absolute bottom-0 left-1/2 z-30 flex h-[34px] w-[220px] -translate-x-1/2 cursor-grab touch-none items-end justify-center pb-[8px] active:cursor-grabbing"
    >
      <span
        className={`h-[5px] w-[139px] rounded-full transition-transform group-hover:scale-x-110 ${dark ? "bg-neutral-900" : "bg-white"}`}
      />
    </button>
  );
}
