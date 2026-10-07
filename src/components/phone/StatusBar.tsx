import { formatTime, useNow } from "../../lib/time";
import { ISLAND } from "./constants";

/** Sits either side of the Dynamic Island, which is part of the bezel image. */
/** `activity`: a Live Activity is using the island, so the signal bars give way, as on iOS. */
export function StatusBar({ light, activity = false }: { light: boolean; activity?: boolean }) {
  const time = formatTime(useNow());

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
      {/* Signal, Wi-Fi and battery, measured from a real iPhone 17 status bar (points). */}
      <span className="absolute left-[288px] top-[26px] flex h-[13px] items-end gap-[7px]">
        {!activity && <Signal />}
        <WiFi />
        <Battery />
      </span>
    </div>
  );
}

function Signal() {
  // Four bars, bottom-aligned, 20pt across.
  const bars = [4.7, 7.2, 9.7, 12.3];
  return (
    <svg width="20" height="13" viewBox="0 0 20 13" fill="currentColor" aria-hidden>
      {bars.map((h, i) => (
        <rect key={i} x={i * 5.4} y={13 - h} width="3.6" height={h} rx="1.1" />
      ))}
    </svg>
  );
}

function WiFi() {
  // Two bands and a wedge cut from one circle centred at the bottom tip, ±43°. Fitted to the
  // real glyph from an iPhone 17 screenshot; a thin round stroke softens the corners as Apple's
  // are, so each radius is pulled in by half of it.
  const cx = 8.5;
  const cy = 12.9;
  const a = (43.1 * Math.PI) / 180;
  const soft = 0.6;
  const sector = (ro: number, ri: number) => {
    ro -= soft / 2;
    ri = ri ? ri + soft / 2 : 0;
    const p = (r: number, s: number) => `${cx + s * r * Math.sin(a)} ${cy - r * Math.cos(a)}`;
    return ri
      ? `M${p(ro, -1)}A${ro} ${ro} 0 0 1 ${p(ro, 1)}L${p(ri, 1)}A${ri} ${ri} 0 0 0 ${p(ri, -1)}Z`
      : `M${cx} ${cy - soft / 2}L${p(ro, -1)}A${ro} ${ro} 0 0 1 ${p(ro, 1)}Z`;
  };
  return (
    <svg width="17" height="13" viewBox="0 0 17 13" aria-hidden>
      <g fill="currentColor" stroke="currentColor" strokeWidth={soft} strokeLinejoin="round">
        <path d={sector(12.51, 10.02)} />
        <path d={sector(8.25, 5.76)} />
        <path d={sector(4.0, 0)} />
      </g>
    </svg>
  );
}

function Battery() {
  // 24.5pt body with a thin translucent outline, the level inset inside it, and the nub.
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="23.5" height="12" rx="3.8" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2" y="2" width="17.5" height="9" rx="2.3" fill="currentColor" />
      <path d="M25.5 4.5v4c.75-.25 1.25-1 1.25-2s-.5-1.75-1.25-2Z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}
