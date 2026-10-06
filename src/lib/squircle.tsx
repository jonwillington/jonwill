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
 * A box shaped as a continuous-corner rectangle that follows its own size.
 * `rim` adds the thin light edge iOS draws around glass surfaces.
 *
 * `glass` takes background/backdrop-filter classes for a frosted layer. That
 * layer is shaped with a mask rather than clip-path: a clip-path ancestor
 * becomes the backdrop root (so nothing behind gets blurred), and Chrome
 * doesn't clip a backdrop-filter to the clip-path of its own element.
 */
export function Squircle({
  radius,
  smoothing,
  rim = false,
  glass,
  className = "",
  style,
  children,
}: {
  radius: number;
  smoothing: number;
  rim?: boolean;
  glass?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<{ path: string; width: number; height: number }>();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // offsetWidth ignores CSS transforms, so the scaled phone still gets point sizes.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (!width || !height) return;
      setShape({
        path: getSvgPath({ width, height, cornerRadius: radius, cornerSmoothing: smoothing }),
        width,
        height,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [radius, smoothing]);

  const mask: CSSProperties | undefined = shape && {
    maskImage: svgMask(shape),
    WebkitMaskImage: svgMask(shape),
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
  };

  return (
    <div
      ref={ref}
      className={className}
      // Glass surfaces shape their layers with masks; everything else clips.
      style={{ ...style, clipPath: !glass && shape ? `path("${shape.path}")` : undefined }}
    >
      {glass && <div className={`absolute inset-0 ${glass}`} style={mask} />}
      {children}
      {rim && shape && (
        <svg className="pointer-events-none absolute inset-0 size-full" style={mask} aria-hidden>
          <defs>
            <linearGradient id="squircle-rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="white" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="white" stopOpacity="0.15" />
              <stop offset="1" stopColor="white" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Stroke is centred on the edge and the outer half is masked off, leaving 1px. */}
          <path d={shape.path} fill="none" stroke="url(#squircle-rim)" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
}

function svgMask({ path, width, height }: { path: string; width: number; height: number }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${path}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
