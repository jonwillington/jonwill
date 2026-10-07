import { useEffect, useId, useRef } from "react";
import { motion } from "motion/react";

import { Squircle } from "../../lib/squircle";

export type AlertAction = {
  label: string;
  /** The highlighted (blue) action. */
  primary?: boolean;
  destructive?: boolean;
  href?: string;
  onPress?: () => void;
};

/**
 * An iOS 26 alert: left-aligned text, pill buttons, Liquid Glass panel.
 * Render inside <AnimatePresence>; it covers the phone screen.
 */
export function IOSAlert({
  title,
  message,
  actions,
  onClose,
}: {
  title: string;
  message: string;
  actions: AlertAction[];
  onClose: () => void;
}) {
  const id = useId();
  // Focus the dialog itself, not a button, so no focus ring shows until someone tabs.
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialog.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <motion.div
      // No opacity on this wrapper or the panel: Chrome only paints a backdrop-filter once every
      // ancestor is fully opaque, so fading them made the frosted glass pop in late (a flicker).
      // The dim animates its own colour, and the glass layers fade themselves (below).
      className="absolute inset-0 z-[60] flex items-center justify-center"
      initial={{ backgroundColor: "rgba(0,0,0,0)" }}
      animate={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      exit={{ backgroundColor: "rgba(0,0,0,0)", transition: { duration: 0.18 } }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      onClick={onClose}
    >
      <motion.div
        ref={dialog}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-body`}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.97, opacity: 0, transition: { duration: 0.15 } }}
        // Leaving can fade the whole panel: losing the blur on the way out is invisible.
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[306px] outline-none"
      >
        {/* Shadow as its own layer: a filter on an ancestor would stop the glass blurring what's behind. */}
        <motion.div
          className="absolute inset-x-[10px] bottom-[-14px] top-[18px] rounded-[40px] bg-black/25 blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.2 }}
        />
        <Squircle
          radius={36}
          smoothing={0.6}
          rim
          glass="alert-glass bg-[rgba(250,250,252,0.82)] backdrop-saturate-[1.8]"
          className="relative text-left text-black"
        >
          <motion.div
            className="relative px-[22px] pb-[18px] pt-[22px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2 }}
          >
            <p id={`${id}-title`} className="text-[17px] font-semibold leading-[22px] tracking-[-0.4px]">
              {title}
            </p>
            <p
              id={`${id}-body`}
              className="mt-[4px] text-[15px] leading-[20px] tracking-[-0.2px] text-[rgba(60,60,67,0.85)]"
            >
              {message}
            </p>
            <div className="mt-[20px] flex gap-[12px]">
              {actions.map((a, i) => {
                const className = `flex h-[48px] flex-1 cursor-pointer items-center justify-center rounded-full text-[17px] tracking-[-0.4px] outline-none focus-visible:ring-2 focus-visible:ring-[#0088ff]/50 ${
                  a.primary
                    ? "bg-[#0088ff] font-semibold text-white"
                    : `bg-[rgba(120,120,128,0.16)] font-medium ${a.destructive ? "text-[#ff383c]" : "text-black"}`
                }`;
                const press = () => {
                  a.onPress?.();
                  onClose();
                };
                return a.href ? (
                  <motion.a
                    key={a.label}
                    href={a.href}
                    target={a.href.startsWith("http") ? "_blank" : undefined}
                    rel={a.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    whileTap={{ scale: 0.96 }}
                    onClick={press}
                    className={className}
                  >
                    {a.label}
                  </motion.a>
                ) : (
                  <motion.button
                    key={a.label}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={press}
                    className={className}
                  >
                    {a.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </Squircle>
      </motion.div>
    </motion.div>
  );
}
