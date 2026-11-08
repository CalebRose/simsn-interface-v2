import React from "react";

interface MetaTextProps {
  children: React.ReactNode;
  classes?: string;
}

/** Secondary text that stays at 12-13px with readable contrast (the Typography "xs" variant is ~8-10px on mobile). */
export const MetaText: React.FC<MetaTextProps> = ({
  children,
  classes = "",
}) => (
  <p
    className={`text-xs sm:text-[13px] leading-snug text-(--text-muted) ${classes}`}
  >
    {children}
  </p>
);
