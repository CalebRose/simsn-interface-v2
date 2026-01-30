import React, { FC, ReactNode } from "react";

export interface TagProps {
  children: ReactNode;
  variant?: "gray" | "blue" | "green" | "red" | "yellow" | "purple" | "indigo";
  size?: "xs" | "sm" | "md";
  className?: string;
}

const tagVariants = {
  gray: "bg-gray-500/20 text-gray-300",
  blue: "bg-blue-500/20 text-blue-400",
  green: "bg-green-500/20 text-green-400",
  red: "bg-red-500/20 text-red-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  purple: "bg-purple-500/20 text-purple-400",
  indigo: "bg-indigo-500/20 text-indigo-400",
};

const tagSizes = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
};

export const Tag: FC<TagProps> = ({
  children,
  variant = "gray",
  size = "xs",
  className = "",
}) => {
  const variantClasses = tagVariants[variant];
  const sizeClasses = tagSizes[size];

  return (
    <span
      className={`${sizeClasses} ${variantClasses} rounded font-medium ${className}`}
    >
      {children}
    </span>
  );
};
