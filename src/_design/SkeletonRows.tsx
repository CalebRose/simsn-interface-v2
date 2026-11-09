import React from "react";

interface SkeletonRowsProps {
  count?: number;
  heightClass?: string;
  classes?: string;
}

/** Placeholder rows shown while a list loads. */
export const SkeletonRows: React.FC<SkeletonRowsProps> = ({
  count = 5,
  heightClass = "h-11",
  classes = "",
}) => (
  <div className={`flex flex-col gap-2 ${classes}`} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`${heightClass} animate-pulse rounded bg-(--text-primary)/10`}
      />
    ))}
  </div>
);
