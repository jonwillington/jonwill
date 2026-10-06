import { motion } from "motion/react";
import { Chip, CloseButton, buttonVariants } from "@heroui/react";

import type { AppEntry } from "../content/apps";
import { IconArt } from "./AppIcon";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function DetailContent({ entry, onClose }: { entry: AppEntry; onClose: () => void }) {
  return (
    <motion.div
      key={entry.id}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.05, delayChildren: 0.08 }}
      className="flex flex-col gap-6"
    >
      <motion.div variants={item} className="flex items-start gap-4">
        <div className="size-16 shrink-0 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.10))]">
          <IconArt entry={entry} size={64} round={entry.id === "about"} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {entry.id === "about" ? "Jon Willington" : entry.name}
          </h2>
          <p className="text-foreground/70">{entry.tagline}</p>
        </div>
        <CloseButton aria-label="Close" onPress={onClose} />
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => (
          <Chip key={tag} size="sm" className="bg-foreground/10 text-foreground">
            {tag}
          </Chip>
        ))}
      </motion.div>

      {entry.body.map((p, i) => (
        <motion.p key={i} variants={item} className="leading-relaxed">
          {p}
        </motion.p>
      ))}

      {entry.highlights && (
        <motion.ul variants={item} className="flex flex-col gap-2">
          {entry.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2.5">
              <span className="mt-[7px] size-2 shrink-0 rounded-full bg-foreground/50" aria-hidden />
              <span>{h}</span>
            </li>
          ))}
        </motion.ul>
      )}

      <motion.div variants={item} className="flex flex-wrap gap-2">
        {entry.links.map((link, i) => {
          const external = link.href.startsWith("http");
          return (
            <a
              key={link.href}
              href={link.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className={buttonVariants({
                size: "sm",
                // Neutral tints so the buttons sit on any app's background.
                className: i === 0 ? "bg-foreground text-background" : "bg-foreground/10 text-foreground",
              })}
            >
              {link.label}
              {external && <span aria-hidden>↗</span>}
            </a>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
