import { useEffect, type ReactNode } from "react";
import { motion } from "motion/react";

import type { AppEntry } from "../../content/apps";
import { Squircle } from "../../lib/squircle";
import { IconArt } from "../AppIcon";
import { SCREEN } from "./constants";

export type MenuAnchor = { x: number; y: number; width: number; height: number };

const MENU_WIDTH = 250;
const ROW = 44;

/**
 * The long-press menu: the screen blurs, the icon lifts, and an iOS 26
 * menu opens from it. `anchor` is the icon's box in screen points.
 */
export function ContextMenu({
  entry,
  anchor,
  onClose,
  onShare,
  onEdit,
  onRemove,
}: {
  entry: AppEntry;
  anchor: MenuAnchor;
  onClose: () => void;
  onShare: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const website = entry.links.find((l) => l.href.startsWith("http") && !/app store/i.test(l.label));
  const appStore = entry.links.find((l) => /app store/i.test(l.label));

  // iOS 26's home-screen menu: the app's own actions, then Share / Edit / Remove.
  const items: (Item | "divider")[] = [
    ...(website
      ? [
          {
            label: `Visit ${website.label}`,
            icon: <Compass />,
            onPress: () => window.open(website.href, "_blank", "noopener"),
          },
        ]
      : []),
    ...(appStore
      ? [
          {
            label: "View on App Store",
            icon: <Glyph d="M9.3 6.2 16 17.8M14.7 6.2 8 17.8M5.2 14.2h13.6" />,
            onPress: () => window.open(appStore.href, "_blank", "noopener"),
          },
        ]
      : []),
    ...(website || appStore ? ["divider" as const] : []),
    {
      label: "Share App",
      icon: (
        <Glyph d="M12 3.5v11M8.3 7.2 12 3.5l3.7 3.7M8.5 10.5H7a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5h-1.5" />
      ),
      onPress: onShare,
    },
    {
      label: "Edit Home Screen",
      icon: (
        <Glyph d="M8.5 2.75h7A2.25 2.25 0 0 1 17.75 5v14a2.25 2.25 0 0 1-2.25 2.25h-7A2.25 2.25 0 0 1 6.25 19V5A2.25 2.25 0 0 1 8.5 2.75ZM9.5 7.5h1.5M13 7.5h1.5M9.5 11h1.5M13 11h1.5M10.5 18.25h3" />
      ),
      onPress: onEdit,
    },
    {
      label: "Remove App",
      icon: <Glyph d="M12 3.25a8.75 8.75 0 1 1 0 17.5 8.75 8.75 0 0 1 0-17.5ZM8 12h8" />,
      onPress: onRemove,
      destructive: true,
    },
  ];

  const rows = items.filter((i) => i !== "divider").length;
  const dividers = items.length - rows;
  const menuHeight = rows * ROW + dividers * 9 + 16;
  const below = anchor.y + anchor.height + 12 + menuHeight < SCREEN.height - 40;
  const alignLeft = anchor.x + anchor.width / 2 < SCREEN.width / 2;
  const left = alignLeft
    ? Math.max(16, anchor.x)
    : Math.min(SCREEN.width - 16 - MENU_WIDTH, anchor.x + anchor.width - MENU_WIDTH);
  const top = below ? anchor.y + anchor.height + 12 : anchor.y - 12 - menuHeight;
  const origin = `${alignLeft ? "left" : "right"} ${below ? "top" : "bottom"}`;

  return (
    // iOS 26 doesn't blur the home screen behind this menu, it just dims it.
    <motion.div className="absolute inset-0 z-[45]" exit={{ transition: { duration: 0.22 } }}>
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        onClick={onClose}
      />

      {/* The icon, lifted out of the blur. */}
      <motion.div
        className="absolute [filter:drop-shadow(0_10px_24px_rgba(0,0,0,0.35))]"
        style={{ left: anchor.x, top: anchor.y, width: anchor.width, height: anchor.height }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        exit={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        <IconArt entry={entry} size={anchor.width} />
      </motion.div>

      <motion.div
        role="menu"
        aria-label={`${entry.name} actions`}
        className="absolute"
        style={{ left, top, width: MENU_WIDTH, transformOrigin: origin }}
        // Grows out of the icon. Scale only, no opacity, so its glass blurs from the first frame.
        initial={{ scale: 0.2 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
      >
        <div className="absolute inset-x-[12px] bottom-[-12px] top-[18px] rounded-[34px] bg-black/20 blur-2xl" />
        {/* Liquid Glass: lighter and clearer than older iOS menus, with a bright rim. */}
        <Squircle
          radius={34}
          smoothing={0.6}
          rim
          glass="bg-[rgba(255,255,255,0.62)] backdrop-blur-[34px] backdrop-saturate-[2]"
          className="relative py-[8px] text-black"
        >
          <div className="relative">
            {items.map((item, i) =>
              item === "divider" ? (
                <div key={`d${i}`} className="mx-[20px] my-[4px] h-px bg-black/[0.12]" />
              ) : (
                <motion.button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  autoFocus={i === 0}
                  onClick={() => {
                    onClose();
                    item.onPress();
                  }}
                  whileTap={{ scale: 0.98 }}
                  // iOS 26 puts the symbol before the label.
                  className={`mx-[8px] flex w-[calc(100%-16px)] cursor-pointer items-center gap-[12px] rounded-[22px] px-[12px] text-left text-[17px] tracking-[-0.43px] outline-none hover:bg-black/[0.06] focus-visible:bg-black/[0.06] ${item.destructive ? "text-[#ff383c]" : "text-black"}`}
                  style={{ height: ROW }}
                >
                  <span className={`flex w-[22px] justify-center ${item.destructive ? "" : "text-black/85"}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </motion.button>
              ),
            )}
          </div>
        </Squircle>
      </motion.div>
    </motion.div>
  );
}

type Item = { label: string; icon: ReactNode; onPress: () => void; destructive?: boolean };

function Glyph({ d }: { d: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

function Compass() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}
