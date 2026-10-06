import type { ReactNode } from "react";
import { motion } from "motion/react";

import { formatGbp, type Live } from "../../lib/live";
import { SHAPE, Squircle } from "../../lib/squircle";
import { timeAgo } from "../../lib/time";
import { GRID, LABEL, WIDGET } from "./constants";

type OpenFrom = (rect: DOMRect) => void;

/** A widget slot two icon rows tall: the widget, then its label like an app icon's. */
function Slot({ label, width, children }: { label: string; width: number | string; children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col items-center" style={{ height: 2 * GRID.rowPitch, width }}>
      {children}
      <span className={`mt-[6.5px] ${LABEL}`}>{label}</span>
    </div>
  );
}

function WidgetButton({
  label,
  onOpen,
  height,
  children,
}: {
  label: string;
  onOpen: OpenFrom;
  height: number;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.96 }}
      onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}
      className="relative w-full cursor-pointer text-left [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.18))]"
      style={{ height }}
    >
      <Squircle radius={SHAPE.widget.radius} smoothing={SHAPE.widget.smoothing} rim className="absolute inset-0">
        {children}
      </Squircle>
    </motion.button>
  );
}

/**
 * The "me" entry: a medium Maps-style widget with my photo pinned over
 * Istanbul. The maps are static renders (public/istanbul-map*.jpg).
 */
export function MeWidget({ onOpen, dark }: { onOpen: OpenFrom; dark: boolean }) {
  return (
    <Slot label="Find My" width="100%">
      <WidgetButton label="Jon Willington, currently in Istanbul" onOpen={onOpen} height={WIDGET.medium.height}>
        <img src="/istanbul-map.jpg" alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
        <img
          src="/istanbul-map-dark.jpg"
          alt=""
          draggable={false}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${dark ? "opacity-100" : "opacity-0"}`}
        />

        {/* Photo pin over Beyoğlu, Find My style */}
        <span className="absolute left-[37%] top-[44%] -translate-x-1/2 -translate-y-full">
          <span className="location-pulse absolute bottom-[-12px] left-1/2 size-[44px] -translate-x-1/2 rounded-full bg-[#0a84ff]/25" />
          <span className="relative block size-[50px] overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
            <img src="/me.jpg" alt="" draggable={false} className="size-full object-cover" />
          </span>
          <span className="relative mx-auto -mt-[3px] block size-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]" />
        </span>

        <span className="absolute inset-x-0 bottom-0 h-[78px] bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-[12px] left-[14px] text-white">
          <span className="block text-[20px] font-bold leading-tight tracking-[-0.4px]">Jon Willington</span>
          <span className="flex items-center gap-[5px] text-[13px] font-medium text-white/85">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M21.7 2.3a1 1 0 0 0-1.1-.2L2.9 9.8a1 1 0 0 0 .1 1.9l7.6 1.7 1.7 7.6a1 1 0 0 0 1.9.1l7.7-17.7a1 1 0 0 0-.2-1.1Z" />
            </svg>
            Currently in Istanbul
          </span>
        </span>
        <span className="absolute bottom-[6px] right-[10px] text-[7px] text-white/70">© OpenStreetMap</span>
      </WidgetButton>
    </Slot>
  );
}

const RATING_LABEL = { significant: "Significant", noteworthy: "Noteworthy", minor: "Minor", routine: "Routine" };

/** Small ddbx widget: the latest highly rated director buy, in the app's own palette. */
export function DdbxWidget({ live, onOpen }: { live: Live["ddbx"] | undefined; onOpen: OpenFrom }) {
  return (
    <Slot label="ddbx" width={WIDGET.small.size}>
      <WidgetButton
        label={live ? `ddbx: ${live.company}, ${RATING_LABEL[live.rating]} buy` : "ddbx"}
        onOpen={onOpen}
        height={WIDGET.small.size}
      >
        <span className="absolute inset-0 flex flex-col bg-[#231911] p-[14px] text-[#f3e9df]">
          <span className="flex items-center justify-between">
            <span className="text-[15px] font-bold tracking-[-0.5px]">ddbx</span>
            {live && <span className="text-[11px] font-medium text-[#f3e9df]/50">{timeAgo(live.at)}</span>}
          </span>
          {live ? (
            <>
              <span className="mt-[10px] inline-flex w-fit items-center gap-[5px] rounded-full bg-[#e8aa76]/15 px-[7px] py-[2px] text-[10.5px] font-semibold uppercase tracking-[0.3px] text-[#e8aa76]">
                <span className="size-[5px] rounded-full bg-[#e8aa76]" />
                {RATING_LABEL[live.rating]}
              </span>
              <span className="mt-[7px] line-clamp-2 text-[14px] font-semibold leading-[17px] tracking-[-0.3px]">
                {live.company}
              </span>
              <span className="mt-auto">
                <span className="block text-[24px] font-bold leading-none tracking-[-0.8px] tabular-nums">
                  {formatGbp(live.valueGbp)}
                </span>
                <span className="mt-[3px] block truncate text-[11px] text-[#f3e9df]/55">{live.role}</span>
              </span>
            </>
          ) : (
            <span className="mt-auto text-[13px] leading-[17px] text-[#f3e9df]/60">
              Director dealings, rated as they happen.
            </span>
          )}
        </span>
      </WidgetButton>
    </Slot>
  );
}

/** Small Istanbrew widget: how many shops are open right now, over a photo of one of them. */
export function IstanbrewWidget({ live, onOpen }: { live: Live["istanbrew"] | undefined; onOpen: OpenFrom }) {
  const pick = live?.pick;
  return (
    <Slot label="Istanbrew" width={WIDGET.small.size}>
      <WidgetButton
        label={live ? `Istanbrew: ${live.openNow} coffee shops open now` : "Istanbrew"}
        onOpen={onOpen}
        height={WIDGET.small.size}
      >
        <span className="absolute inset-0 bg-[#fbf8f3]">
          {pick?.image && (
            <img src={pick.image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
          )}
          <span
            className={`absolute inset-0 ${pick?.image ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.15)_55%,rgba(0,0,0,0.7)_100%)]" : ""}`}
          />
          <span
            className={`absolute inset-0 flex flex-col p-[14px] ${pick?.image ? "text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]" : "text-[#2a1d14]"}`}
          >
            <span className="flex items-center gap-[6px] text-[12px] font-semibold">
              <span className="relative flex size-[8px]">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#34c759] opacity-60" />
                <span className="relative size-[8px] rounded-full bg-[#34c759]" />
              </span>
              Open now
            </span>
            {live ? (
              <span className="mt-[2px] text-[30px] font-bold leading-[34px] tracking-[-1px] tabular-nums">
                {live.openNow}
                <span className="ml-[3px] text-[13px] font-semibold tracking-normal opacity-75">shops</span>
              </span>
            ) : (
              <span className="mt-[4px] text-[15px] font-semibold leading-[19px]">Speciality coffee in Istanbul</span>
            )}
            {pick && (
              <span className="mt-auto">
                <span className="block truncate text-[14px] font-semibold leading-[17px]">{pick.name}</span>
                {pick.area && <span className="block truncate text-[12px] opacity-80">{pick.area}</span>}
              </span>
            )}
          </span>
        </span>
      </WidgetButton>
    </Slot>
  );
}
