import React from "react";
import { Text } from "./Typography";

// 🔑 Define Props Interface for Logo
interface LogoProps {
  url: string;
  variant?: "tiny" | "xs" | "normal" | "small" | "large";
  label?: string;
  classes?: string;
  textClass?: string;
  containerClass?: string;
}

export const Logo: React.FC<LogoProps> = ({
  url,
  variant = "normal",
  label,
  classes = "",
  textClass = "",
  containerClass = "",
}) => {
  const styles: Record<NonNullable<LogoProps["variant"]>, string> = {
    tiny: "h-6 max-h-6 max-w-6",
    xs: "h-7 max-h-7 max-w-7 md:max-h-12 md:max-w-12",
    small: "h-8 max-h-8 max-w-8 md:max-h-16 md:max-w-16",
    normal: "h-12 max-h-12 max-w-12 md:max-h-20 md:max-w-20",
    large: "h-14 max-h-14 max-w-14 md:max-h-40 md:max-w-40",
  };

  const logoStyle = styles[variant] ?? styles.normal;

  return (
    <div className={`flex flex-col ${containerClass}`}>
      <img className={`object-contain ${classes} ${logoStyle}`} src={url} alt="logo" />
      {label && label.length > 0 && (
        <Text variant="alternate" className={textClass}>
          {label}
        </Text>
      )}
    </div>
  );
};
