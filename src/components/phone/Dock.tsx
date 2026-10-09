import { useRef } from "react";
import { motion } from "motion/react";

import { SHAPE, Squircle, iconClip } from "../../lib/squircle";
import { GLASS, GLASS_EDGE } from "./constants";
import { SITE } from "../../content/site";
import { track } from "../../lib/analytics";
import { asset } from "../../lib/asset";

export function SearchPill({ onPress, hidden }: { onPress: () => void; hidden: boolean }) {
  return (
    <motion.button
      type="button"
      // Centred with left, not a translate: the shared-layout morph owns transform.
      layoutId="spotlight-field"
      onClick={onPress}
      aria-label="Search (⌘K)"
      style={{ borderRadius: 999, opacity: hidden ? 0 : 1 }}
      whileTap={{ scale: 0.94 }}
      className={`absolute bottom-[141px] left-[calc(50%-39px)] z-10 flex h-[28.5px] w-[78px] cursor-pointer items-center justify-center gap-[5px] text-[15px] text-white ${GLASS} ${GLASS_EDGE}`}
    >
      <SearchGlyph />
      Search
    </motion.button>
  );
}

export function SearchGlyph({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="m16 16 5.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

/** The dock; `hidden` fades it away while Spotlight is open, as iOS does. */
export type DockId = "mail" | "linkedin" | "whatsapp" | "github";

/** Each dock icon's name and image, also used to draw its long-press menu. */
export const DOCK_ICONS: Record<DockId, { label: string; icon: string }> = {
  mail: { label: "Mail", icon: "/icons/mail-glass.png" },
  linkedin: { label: "LinkedIn", icon: "/icons/linkedin.png" },
  whatsapp: { label: "WhatsApp", icon: "/icons/whatsapp.png" },
  github: { label: "GitHub", icon: "/icons/github.png" },
};

export function Dock({
  framed,
  hidden = false,
  onWhatsApp,
  onGitHub,
  onMenu,
}: {
  framed: boolean;
  hidden?: boolean;
  onWhatsApp: () => void;
  /** GitHub opens an offer of the template first, not the repo. */
  onGitHub: () => void;
  /** Long-press or right-click on a dock icon. */
  onMenu: (id: DockId, rect: DOMRect) => void;
}) {
  return (
    <Squircle
      radius={SHAPE.dock.radius}
      smoothing={SHAPE.dock.smoothing}
      rim
      glass={GLASS}
      className={`absolute inset-x-[17px] z-10 flex h-[101.5px] items-center justify-center gap-[23.7px] transition-[opacity,transform] duration-300 ${hidden ? "pointer-events-none translate-y-[20px] opacity-0" : ""} ${framed ? "bottom-[18px]" : "bottom-[max(18px,env(safe-area-inset-bottom))]"}`}
    >
      <DockLink
        href={`mailto:${SITE.email}`}
        label="Email"
        icon={DOCK_ICONS.mail.icon}
        onMenu={(r) => onMenu("mail", r)}
      />
      <DockLink
        href={SITE.linkedin.url}
        label="LinkedIn"
        icon={DOCK_ICONS.linkedin.icon}
        onMenu={(r) => onMenu("linkedin", r)}
      />
      {SITE.whatsapp && (
        <DockLink
          onPress={() => {
            track("dock_tap", { app: "whatsapp" });
            onWhatsApp();
          }}
          label="WhatsApp"
          icon={DOCK_ICONS.whatsapp.icon}
          onMenu={(r) => onMenu("whatsapp", r)}
        />
      )}
      {SITE.github && (
        <DockLink
          onPress={() => {
            track("dock_tap", { app: "github" });
            onGitHub();
          }}
          label="This site on GitHub"
          icon={DOCK_ICONS.github.icon}
          onMenu={(r) => onMenu("github", r)}
        />
      )}
    </Squircle>
  );
}

/** A dock icon: a link, or a button when `onPress` is given. Hold or right-click for its menu. */
function DockLink({
  href,
  onPress,
  label,
  icon,
  onMenu,
}: {
  href?: string;
  onPress?: () => void;
  label: string;
  icon: string;
  onMenu: (rect: DOMRect) => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const held = useRef(false);
  const cancel = () => window.clearTimeout(timer.current);
  const press = {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      held.current = false;
      const el = e.currentTarget;
      timer.current = window.setTimeout(() => {
        held.current = true;
        onMenu(el.getBoundingClientRect());
      }, 500);
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    // Links are draggable by default: holding one and moving a pixel starts a native drag,
    // which cancels the press before the menu opens. Mail, LinkedIn and GitHub are links.
    // (draggable=false plus -webkit-user-drag:none; Motion owns the onDragStart prop name.)
    draggable: false,
    onDragStartCapture: (e: React.DragEvent) => e.preventDefault(),
    onContextMenu: (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      cancel();
      onMenu(e.currentTarget.getBoundingClientRect());
    },
    // A hold opens the menu; don't also follow the link or press the button.
    onClickCapture: (e: React.MouseEvent) => {
      if (held.current) {
        e.preventDefault();
        e.stopPropagation();
        held.current = false;
      }
    },
  };
  const external = href?.startsWith("http");
  const art = (
    <img
      src={asset(icon)}
      alt=""
      draggable={false}
      className="size-full select-none object-cover"
      style={{ clipPath: iconClip(64) }}
    />
  );
  const className =
    "relative size-[64px] cursor-pointer select-none [-webkit-touch-callout:none] [-webkit-user-drag:none] [filter:drop-shadow(0_2px_5px_rgba(0,0,0,0.12))]";

  if (onPress) {
    return (
      <motion.button
        type="button"
        aria-label={label}
        whileTap={{ scale: 1.1 }}
        onClick={onPress}
        {...press}
        className={className}
      >
        {art}
      </motion.button>
    );
  }
  return (
    <motion.a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      whileTap={{ scale: 1.1 }}
      {...press}
      className={className}
    >
      {art}
    </motion.a>
  );
}
