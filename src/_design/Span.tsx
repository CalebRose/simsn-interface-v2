import React, { FC, ReactNode } from "react";

export const Span: FC<{
  children: ReactNode;
  onClick?: () => void;
  classes?: string;
}> = ({ children, onClick, classes = "" }) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!onClick) return;
    (e.target as HTMLElement).style.color = "#fcd53f";
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!onClick) return;
    (e.target as HTMLElement).style.color = "";
  };
  return (
    <span
      className={`text-xs cursor-pointer ${classes}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
