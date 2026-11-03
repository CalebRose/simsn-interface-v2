import React from "react";

interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  label: string;
  classes?: string;
}

/** Borderless icon/glyph button with a 44px touch target on mobile. */
export const IconButton: React.FC<IconButtonProps> = ({
  label,
  classes = "",
  children,
  type = "button",
  ...rest
}) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={`min-h-11 min-w-11 rounded-sm text-sm text-(--text-muted) transition-colors hover:bg-(--text-primary)/10 hover:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--accent-primary) sm:min-h-8 sm:min-w-8 ${classes}`}
    {...rest}
  >
    {children}
  </button>
);
