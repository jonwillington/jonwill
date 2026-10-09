import { motion } from "motion/react";

import type { AppEntry } from "../../content/apps";
import { IconArt } from "../AppIcon";
import { entryName } from "../../content/site";

/** A launch screen: the icon and name on the app's colour. */
export function Splash({ entry }: { entry: AppEntry }) {
  const light = entry.scheme === "light";
  const about = entry.id === "about";
  return (
    <div
      className={`flex size-full flex-col items-center justify-center gap-5 px-10 text-center ${light ? "text-neutral-900" : "text-white"}`}
    >
      <motion.div
        className={`size-[112px] [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.12))] ${about ? "rounded-full ring-4 ring-white" : ""}`}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 20 }}
      >
        <IconArt entry={entry} size={112} round={about} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-[28px] font-bold tracking-tight">{entry.title ?? entryName(entry)}</p>
        {entry.tagline && (
          <p className={`mt-1 text-[16px] ${light ? "text-neutral-900/70" : "text-white/70"}`}>{entry.tagline}</p>
        )}
      </motion.div>
    </div>
  );
}
