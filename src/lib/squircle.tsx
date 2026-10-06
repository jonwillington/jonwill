import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { getSvgPath } from "figma-squircle";

// iOS draws "continuous" corners: the curve eases into the straight edge
// instead of meeting it as a circular arc, which border-radius can't do.
// These values were fitted to an iPhone 17 screenshot (iOS 26).
export const SHAPE = {
  /** App icons: radius as a fraction of the icon's size. */
  icon: { radius: 0.2578, smoothing: 0.65 },
  widget: { radius: 28, smoothing: 0.6 },
  dock: { radius: 39.3, smoothing: 0.6 },
};

const iconClips = new Map<number, string>();

/** clip-path for a square app icon of `size` px. */
export function iconClip(size: number) {
  let clip = iconClips.get(size);
  if (!clip) {
    const path = getSvgPath({
      width: size,
      height: size,
      cornerRadius: size * SHAPE.icon.radius,
      cornerSmoothing: SHAPE.icon.smoothing,
    });
    clip = `path("${path}")`;
    iconClips.set(size, clip);
  }
  return clip;
}

/**
 * A box clipped to a continuous-corner rectangle that follows its own size.
 * `rim` adds the thin light edge iOS draws around glass surfaces.
 */
export function Squircle({
  radius,
  smoothing,
  rim = false,
  className = "",
  style,
  children,
}: {
  radius: number;
  smoothing: number;
  rim?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<string>();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // offsetWidth ignores CSS transforms, so the scaled phone still gets point sizes.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (!width || !height) return;
      setPath(getSvgPath({ width, height, cornerRadius: radius, cornerSmoothing: smoothing }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [radius, smoothing]);

  return (
    <div ref={ref} className={className} style={{ ...style, clipPath: path && `path("${path}")` }}>
      {children}
      {rim && path && (
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="squircle-rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="white" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="white" stopOpacity="0.15" />
              <stop offset="1" stopColor="white" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Stroke is centred on the clip edge, so 1px of this 2px line shows. */}
          <path d={path} fill="none" stroke="url(#squircle-rim)" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
}
