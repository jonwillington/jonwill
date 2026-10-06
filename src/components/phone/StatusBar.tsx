import { formatTime, useNow } from "../../lib/time";
import { ISLAND } from "./constants";

/** Sits either side of the Dynamic Island, which is part of the bezel image. */
/** `activity`: a Live Activity is using the island, so the signal bars give way, as on iOS. */
export function StatusBar({ light, activity = false }: { light: boolean; activity?: boolean }) {
  const time = formatTime(useNow());
  const right = ISLAND.left + ISLAND.width;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-50 h-[54px] transition-colors duration-300 ${light ? "text-white" : "text-neutral-900"}`}
    >
      <span
        className="absolute top-[21px] text-center text-[17px] font-semibold leading-[22px] tracking-[-0.4px] tabular-nums"
        style={{ left: 0, width: ISLAND.left }}
      >
        {time}
      </span>
      <span
        className="absolute top-[21px] flex h-[22px] items-center justify-center gap-[6px]"
        style={{ left: right, width: 402 - right }}
      >
        {!activity && (
          <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor" aria-hidden>
            <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
            <rect x="5.2" y="5" width="3.2" height="7" rx="1" />
            <rect x="10.4" y="2.5" width="3.2" height="9.5" rx="1" />
            <rect x="15.6" y="0" width="3.2" height="12" rx="1" />
          </svg>
        )}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
          <path d="M8.5 2.3c2.4 0 4.6.9 6.2 2.5l1.2-1.2A10.4 10.4 0 0 0 8.5.6 10.4 10.4 0 0 0 1.1 3.6l1.2 1.2a8.7 8.7 0 0 1 6.2-2.5Zm0 3.5c1.4 0 2.7.5 3.7 1.4l1.2-1.2a6.9 6.9 0 0 0-9.8 0l1.2 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.5c-.5 0-1 .2-1.3.6l1.3 1.3 1.3-1.3c-.3-.4-.8-.6-1.3-.6Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="23" height="12" rx="4" stroke="currentColor" opacity="0.35" />
          <rect x="2" y="2" width="17" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}
