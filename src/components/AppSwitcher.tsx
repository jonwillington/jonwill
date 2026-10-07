import { motion } from "motion/react";

import { ABOUT, APPS, type AppEntry } from "../content/apps";
import { IconArt } from "./AppIcon";
import { entryName } from "../content/site";

/**
 * A row of every app along the bottom of the page, so visitors can jump
 * between them without going back to the home screen. The open one lifts.
 */
export function AppSwitcher({ open, onOpen }: { open: AppEntry | null; onOpen: (e: AppEntry) => void }) {
  return (
    <nav
      aria-label="Apps"
      className="flex items-center gap-1.5 rounded-full bg-foreground/[0.05] p-1.5 backdrop-blur-md"
    >
      {[ABOUT, ...APPS].map((e) => {
        const active = open?.id === e.id;
        const label = entryName(e);
        return (
          <motion.button
            key={e.id}
            type="button"
            aria-label={label}
            aria-current={active ? "page" : undefined}
            title={label}
            onClick={() => onOpen(e)}
            whileHover={{ y: -3, scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            animate={{ y: active ? -4 : 0, scale: active ? 1.12 : 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="relative size-8 cursor-pointer rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          >
            <IconArt entry={e} size={32} round={e.id === "about"} />
            {active && (
              <motion.span
                layoutId="switcher-dot"
                className="absolute -bottom-[7px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-foreground/70"
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
