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
        <div className={`size-16 shrink-0 overflow-hidden shadow-md ${entry.id === "about" ? "rounded-full" : "[border-radius:22.5%]"}`}>
          <IconArt entry={entry} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold tracking-tight">{entry.id === "about" ? "Jon Willington" : entry.name}</h2>
          <p className="text-muted">{entry.tagline}</p>
        </div>
        <CloseButton aria-label="Close" onPress={onClose} />
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => (
          <Chip key={tag} size="sm">
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
              <span
                className="mt-[7px] size-2 shrink-0 rounded-full"
                style={{ background: entry.accent }}
                aria-hidden
              />
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
              className={buttonVariants({ variant: i === 0 ? "primary" : "secondary", size: "sm" })}
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
