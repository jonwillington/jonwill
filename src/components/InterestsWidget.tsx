import { motion } from "motion/react";

import { SHAPE, Squircle } from "../lib/squircle";

// Small, soft-3D illustrations in the spirit of Airbnb's animated icons:
// gradients for volume, a highlight, a contact shadow, and one gentle loop each.

const LOOP = { repeat: Infinity, ease: "easeInOut" } as const;

export function CoffeeArt({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="cup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6ded2" />
        </linearGradient>
        <linearGradient id="saucer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4efe7" />
          <stop offset="1" stopColor="#d6ccbe" />
        </linearGradient>
        <radialGradient id="crema" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#b9773f" />
          <stop offset="1" stopColor="#5a3218" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="55" rx="21" ry="4" fill="#000" opacity="0.12" />
      <ellipse cx="32" cy="50" rx="22" ry="6" fill="url(#saucer)" />
      <path d="M44 33c6 0 8 3 8 6s-3 6-9 6" fill="none" stroke="#d9cfc1" strokeWidth="4" strokeLinecap="round" />
      <path d="M16 30h32l-3 15a6 6 0 0 1-6 5H25a6 6 0 0 1-6-5Z" fill="url(#cup)" />
      <ellipse cx="32" cy="30" rx="16" ry="4.5" fill="#efe8de" />
      <ellipse cx="32" cy="30.5" rx="13.5" ry="3.4" fill="url(#crema)" />
      <path d="M20 34c1 6 2 10 4 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" fill="none" />
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${26 + i * 6} 24c-3-3 3-5 0-9s3-5 0-8`}
          fill="none"
          stroke="#c9b8a6"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: [0, 0.8, 0], y: [2, -4, -8] }}
          transition={{ ...LOOP, duration: 2.6, delay: i * 0.6 }}
        />
      ))}
    </svg>
  );
}

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy="42" r="10.5" fill="none" stroke="#2b3442" strokeWidth="3.2" />
      <circle cx={cx} cy="42" r="8.6" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" />
      {/* The spokes are symmetric, so their own box is centred on the hub. */}
      <g className="spin-wheel">
        {[0, 45, 90, 135].map((a) => (
          <line
            key={a}
            x1={cx - 9}
            y1="42"
            x2={cx + 9}
            y2="42"
            stroke="#8a94a3"
            strokeWidth="0.9"
            transform={`rotate(${a} ${cx} 42)`}
          />
        ))}
      </g>
      <circle cx={cx} cy="42" r="1.8" fill="#2b3442" />
    </g>
  );
}

export function BikeArt({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a7f" />
          <stop offset="1" stopColor="#e3394a" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="55" rx="24" ry="3.5" fill="#000" opacity="0.12" />
      <motion.g animate={{ y: [0, -1.2, 0] }} transition={{ ...LOOP, duration: 0.7 }}>
        <Wheel cx={16} />
        <Wheel cx={48} />
        <path
          d="M16 42 L26 26 L42 26 L48 42 M26 26 L32 42 L42 26 M32 42 L16 42"
          fill="none"
          stroke="url(#frame)"
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path d="M24 22h7" stroke="#2b3442" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M41 26l-1-6h6" fill="none" stroke="#2b3442" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="42" r="3" fill="#2b3442" />
      </motion.g>
    </svg>
  );
}

export function WalkArt({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="upper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6aa2ff" />
          <stop offset="1" stopColor="#2f67e0" />
        </linearGradient>
      </defs>
      <motion.ellipse
        cx="32"
        cy="55"
        rx="20"
        ry="3.5"
        fill="#000"
        animate={{ opacity: [0.14, 0.06, 0.14], scaleX: [1, 0.8, 1] }}
        transition={{ ...LOOP, duration: 1.3 }}
      />
      {/* Dust that puffs out each time the shoe lands */}
      {[-1, 1].map((d) => (
        <motion.circle
          key={d}
          cx={32 + d * 18}
          cy="52"
          r="2.5"
          fill="#d8d2c8"
          animate={{ opacity: [0, 0, 0.9, 0], x: [0, 0, d * 3, d * 6], scale: [0.4, 0.4, 1, 1.3] }}
          transition={{ ...LOOP, duration: 1.3, times: [0, 0.48, 0.6, 1] }}
        />
      ))}
      <motion.g
        // Pivot on the toe, in SVG units.
        style={{ transformBox: "view-box", transformOrigin: "48px 50px" }}
        animate={{ rotate: [0, -14, 0], y: [0, -5, 0] }}
        transition={{ ...LOOP, duration: 1.3, times: [0, 0.3, 0.55] }}
      >
        <path d="M10 44c0-3 2-5 5-5h11l8-12c2-3 7-3 10 0l6 6c3 3 5 7 5 11v3H10Z" fill="url(#upper)" />
        <path d="M9 46h47a3 3 0 0 1 0 6H12a3 3 0 0 1-3-3Z" fill="#f7f4ef" />
        <path d="M9 50h50" stroke="#d9d2c6" strokeWidth="1.5" />
        <path d="M33 30l5 4M30 34l5 4M27 38l5 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 41c2-1 5-1 7 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" fill="none" />
      </motion.g>
    </svg>
  );
}

const INTERESTS = [
  { label: "Coffee", Art: CoffeeArt },
  { label: "Cycling", Art: BikeArt },
  { label: "Walking", Art: WalkArt },
];

/** A medium widget the same size as Find My, with a label underneath. */
export function InterestsWidget({ height, onOpen }: { height: number; onOpen: (rect: DOMRect) => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Interests: coffee, cycling and walking"
      whileTap={{ scale: 0.96 }}
      onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}
      className="relative w-full cursor-pointer text-left [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.18))]"
      style={{ height }}
    >
      <Squircle
        radius={SHAPE.widget.radius}
        smoothing={SHAPE.widget.smoothing}
        rim
        className="absolute inset-0 flex flex-col bg-[#fbf8f4] px-[16px] pb-[12px] pt-[14px]"
      >
        <span className="text-[13px] font-semibold leading-[16px] text-[#e3394a]">Off the clock</span>
        <span className="mt-[2px] flex flex-1 items-center justify-around">
          {INTERESTS.map(({ label, Art }) => (
            <span key={label} className="flex flex-col items-center gap-[4px]">
              <Art size={64} />
              <span className="text-[13px] font-semibold leading-[16px] text-[#222]">{label}</span>
            </span>
          ))}
        </span>
      </Squircle>
    </motion.button>
  );
}

/** The interests "icon" for the splash and detail panel: the coffee cup on a tile. */
export function InterestsIcon({ size }: { size: number }) {
  return (
    <span className="flex size-full items-center justify-center bg-[#fbf8f4]">
      <CoffeeArt size={size * 0.85} />
    </span>
  );
}
