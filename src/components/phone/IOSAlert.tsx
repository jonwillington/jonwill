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
  const firstButton = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);

  useEffect(() => {
    firstButton.current?.focus({ preventScroll: true });
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
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-body`}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0, transition: { duration: 0.15 } }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[306px]"
      >
        {/* Shadow as its own layer: a filter on an ancestor would stop the glass blurring what's behind. */}
        <div className="absolute inset-x-[10px] bottom-[-14px] top-[18px] rounded-[40px] bg-black/25 blur-2xl" />
        <Squircle
          radius={36}
          smoothing={0.6}
          rim
          glass="bg-[rgba(250,250,252,0.82)] backdrop-blur-[30px] backdrop-saturate-[1.8]"
          className="relative text-left text-black"
        >
          <div className="relative px-[22px] pb-[18px] pt-[22px]">
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
                const ref = (el: HTMLButtonElement | HTMLAnchorElement | null) => {
                  if (i === 0) firstButton.current = el;
                };
                return a.href ? (
                  <motion.a
                    key={a.label}
                    ref={ref}
                    href={a.href}
                    whileTap={{ scale: 0.96 }}
                    onClick={press}
                    className={className}
                  >
                    {a.label}
                  </motion.a>
                ) : (
                  <motion.button
                    key={a.label}
                    ref={ref}
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
          </div>
        </Squircle>
      </motion.div>
    </motion.div>
  );
}
