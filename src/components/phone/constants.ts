// Apple's iPhone 17 bezel (public/device) is 1350×2760 at @3x, so the
// device is 450×920pt with the 402×874pt screen inset at (24, 23).
export const DEVICE = { width: 450, height: 920 };
export const SCREEN = { left: 24, top: 23, width: 402, height: 874, radius: 63 };

// The Dynamic Island, measured from the bezel, relative to the screen.
export const ISLAND = { left: 139, top: 14.33, width: 124.33, height: 35.67 };

// Home-screen metrics, measured from an iPhone 17 screenshot (points).
export const GRID = { top: 89.33, left: 30.33, icon: 64, colPitch: 92.56, rowPitch: 100.33 };
export const WIDGET = { medium: { height: 164.33 }, small: { size: 164.33 } };

// Pills keep a CSS edge highlight; squircle surfaces get theirs from <Squircle rim>.
export const GLASS = "bg-white/20 backdrop-blur-2xl backdrop-saturate-150";
export const GLASS_EDGE = "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_0.5px_rgba(255,255,255,0.25)]";

/** Text under icons and widgets on the home screen. */
export const LABEL =
  "text-[12px] font-medium leading-[14px] tracking-[-0.1px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]";
