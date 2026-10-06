/** A clear, generously sized close button used by the panel and the drawer. */
export function CloseX({ onPress, label = "Close" }: { onPress: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/[0.08] text-foreground/80 outline-none transition-colors hover:bg-foreground/[0.14] hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/40"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M2 2l10 10M12 2 2 12" />
      </svg>
    </button>
  );
}
