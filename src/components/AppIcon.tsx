import { useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";

import type { AppEntry } from "../content/apps";
import { iconClip } from "../lib/squircle";
import { InterestsIcon } from "./InterestsWidget";

const LONG_PRESS_MS = 500;

type Props = {
  entry: AppEntry;
  /** Position in the grid; also staggers the badge pop-in and the wiggle. */
  index: number;
  editing: boolean;
  badge: boolean;
  /** True while this icon is being dragged to a new spot. */
  dragging: boolean;
  onOpen: (entry: AppEntry, rect: DOMRect) => void;
  onMenu: (entry: AppEntry, rect: DOMRect) => void;
  onRemove: (entry: AppEntry) => void;
  onDragStart: (entry: AppEntry) => void;
  onDragMove: (entry: AppEntry, point: { x: number; y: number }) => void;
  onDragEnd: () => void;
};

export function AppIcon({
  entry,
  index,
  editing,
  badge,
  dragging,
  onOpen,
  onMenu,
  onRemove,
  onDragStart,
  onDragMove,
  onDragEnd,
}: Props) {
  const timer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const moved = useRef(false);
  const button = useRef<HTMLButtonElement>(null);

  const cancelPress = () => window.clearTimeout(timer.current);
  const rect = () => button.current!.getBoundingClientRect();

  return (
    <motion.div
      layout
      // Icons slide into their new places while one is dragged.
      transition={{ type: "spring", stiffness: 500, damping: 38 }}
      className={`relative flex flex-col items-center ${dragging ? "z-20" : "z-0"}`}
      drag={editing}
      dragSnapToOrigin
      dragElastic={1}
      dragMomentum={false}
      onDragStart={() => {
        moved.current = true;
        cancelPress();
        onDragStart(entry);
      }}
      onDrag={(_, info: PanInfo) => onDragMove(entry, info.point)}
      onDragEnd={() => onDragEnd()}
      whileDrag={{ scale: 1.12 }}
    >
      <motion.button
        ref={button}
        type="button"
        aria-label={editing ? `${entry.name}, drag to move` : `Open ${entry.name}`}
        className="relative size-[64px] shrink-0 cursor-pointer outline-none [filter:drop-shadow(0_2px_5px_rgba(0,0,0,0.12))] focus-visible:[filter:drop-shadow(0_0_2px_white)]"
        whileTap={editing ? undefined : { scale: 1.1 }}
        animate={
          editing && !dragging
            ? { rotate: [-2.2, 2.2, -2.2], transition: { repeat: Infinity, duration: 0.26, delay: (index % 3) * 0.06 } }
            : { rotate: 0 }
        }
        onPointerDown={() => {
          longPressed.current = false;
          moved.current = false;
          if (editing) return;
          timer.current = window.setTimeout(() => {
            longPressed.current = true;
            onMenu(entry, rect());
          }, LONG_PRESS_MS);
        }}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault();
          cancelPress();
          if (!editing) onMenu(entry, rect());
        }}
        onClick={() => {
          if (longPressed.current || moved.current || editing) return;
          onOpen(entry, rect());
        }}
      >
        <IconArt entry={entry} />
        <AnimatePresence>
          {badge && !editing && (
            // Size and position measured from an iPhone 17 home screen.
            <motion.span
              aria-label="1 notification"
              className="absolute left-[49px] top-[-11.3px] flex size-[25.7px] items-center justify-center rounded-full bg-[#eb4b46] text-[15px] font-medium leading-none text-white"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                transition: { delay: 0.4 + index * 0.08, type: "spring", stiffness: 500, damping: 18 },
              }}
              exit={{ scale: 0, transition: { duration: 0.15 } }}
            >
              1
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Edit mode's remove button, top-left like iOS. */}
      <AnimatePresence>
        {editing && !dragging && (
          <motion.button
            type="button"
            aria-label={`Remove ${entry.name}`}
            className="absolute left-[-7px] top-[-7px] z-10 flex size-[24px] cursor-pointer items-center justify-center rounded-full bg-[rgba(120,120,128,0.55)] text-white backdrop-blur-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(entry);
            }}
          >
            <span className="h-[2.5px] w-[11px] rounded-full bg-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <span className="mt-[6.5px] max-w-[88px] truncate text-[12px] font-medium leading-[14px] tracking-[-0.1px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
        {entry.name}
      </span>
    </motion.div>
  );
}

/**
 * An app icon clipped to the iOS icon shape at `size` px. `round` draws a
 * circle instead, for my photo.
 */
export function IconArt({ entry, size = 64, round = false }: { entry: AppEntry; size?: number; round?: boolean }) {
  const [failed, setFailed] = useState(false);
  const shape = round ? { borderRadius: "9999px" } : { clipPath: iconClip(size) };

  if (entry.id === "interests") {
    return (
      <span className="block size-full" style={shape}>
        <InterestsIcon size={size} />
      </span>
    );
  }

  if (!entry.icon || failed) {
    return (
      <span
        className="flex size-full items-center justify-center bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500 font-semibold text-white"
        style={shape}
      >
        JW
      </span>
    );
  }

  return (
    <img
      src={entry.icon}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="size-full select-none object-cover"
      style={shape}
    />
  );
}
