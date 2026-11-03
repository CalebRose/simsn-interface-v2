import React from "react";

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
  classes?: string;
}

const sizes = {
  sm: "min-h-9 px-3 text-xs sm:text-sm",
  md: "min-h-11 sm:min-h-9 px-4 text-sm",
};

/** Pill toggle used for league, type and date filters. Theme-aware in light and dark mode. */
export const FilterChip: React.FC<FilterChipProps> = ({
  active,
  onClick,
  children,
  size = "sm",
  classes = "",
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`shrink-0 rounded-full border font-medium transition-colors focus-visible:ring-2 focus-visible:ring-(--accent-primary) ${sizes[size]} ${
      active
        ? "border-(--accent-primary) bg-(--accent-primary)/15 text-(--text-primary)"
        : "border-(--border-primary) bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-surface)"
    } ${classes}`}
  >
    {children}
  </button>
);
