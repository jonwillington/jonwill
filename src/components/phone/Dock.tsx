import { motion } from "motion/react";

import { SHAPE, Squircle, iconClip } from "../../lib/squircle";
import { GLASS, GLASS_EDGE } from "./constants";
import { SITE } from "../../content/site";

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
export function Dock({
  framed,
  hidden = false,
  onWhatsApp,
}: {
  framed: boolean;
  hidden?: boolean;
  onWhatsApp: () => void;
}) {
  return (
    <Squircle
      radius={SHAPE.dock.radius}
      smoothing={SHAPE.dock.smoothing}
      rim
      glass={GLASS}
      className={`absolute inset-x-[17px] z-10 flex h-[101.5px] items-center justify-center gap-[23.7px] transition-[opacity,transform] duration-300 ${hidden ? "pointer-events-none translate-y-[20px] opacity-0" : ""} ${framed ? "bottom-[18px]" : "bottom-[max(18px,env(safe-area-inset-bottom))]"}`}
    >
      <DockLink href={`mailto:${SITE.email}`} label="Email" icon="/icons/mail-glass.png" />
      <DockLink href={SITE.linkedin.url} label="LinkedIn" icon="/icons/linkedin.png" />
      {SITE.whatsapp && <DockLink onPress={onWhatsApp} label="WhatsApp" icon="/icons/whatsapp.png" />}
      {SITE.github && <DockLink href={SITE.github} label="This site on GitHub" icon="/icons/github.png" />}
    </Squircle>
  );
}

/** A dock icon: a link, or a button when `onPress` is given. */
function DockLink({
  href,
  onPress,
  label,
  icon,
}: {
  href?: string;
  onPress?: () => void;
  label: string;
  icon: string;
}) {
  const external = href?.startsWith("http");
  const art = (
    <img
      src={icon}
      alt=""
      draggable={false}
      className="size-full select-none object-cover"
      style={{ clipPath: iconClip(64) }}
    />
  );
  const className = "relative size-[64px] cursor-pointer [filter:drop-shadow(0_2px_5px_rgba(0,0,0,0.12))]";

  if (onPress) {
    return (
      <motion.button
        type="button"
        aria-label={label}
        whileTap={{ scale: 0.88 }}
        onClick={onPress}
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
      whileTap={{ scale: 0.88 }}
      className={className}
    >
      {art}
    </motion.a>
  );
}
