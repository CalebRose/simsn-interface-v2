import React, { ReactNode } from "react";

// 🔑 Define Prop Types
export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "body-small"
  | "small"
  | "xs"
  | "h1-alt"
  | "h2-alt"
  | "h3-alt"
  | "alternate"
  | "primary"
  | "secondary"
  | "success"
  | "danger";

interface TextProps {
  variant?: TextVariant;
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  classes?: string;
  style?: React.CSSProperties | undefined;
}

// ✅ Define Size, Style, and Tag Configurations
const tags: Record<TextVariant, keyof JSX.IntrinsicElements> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "span",
  body: "p",
  "body-small": "p",
  small: "p",
  xs: "p",
  "h1-alt": "h1",
  "h2-alt": "h2",
  "h3-alt": "p",
  alternate: "p",
  primary: "p",
  secondary: "p",
  success: "p",
  danger: "p",
};

const sizes: Record<TextVariant, string> = {
  h1: "text-4xl sm:text-5xl font-semibold",
  h2: "text-3xl sm:text-4xl font-semibold",
  h3: "text-2xl sm:text-3xl font-semibold",
  h4: "text-xl sm:text-2xl 3xl:text-4xl font-semibold",
  h5: "text-lg sm:text-xl 3xl:text-3xl font-semibold",
  h6: "text-base sm:text-xl 3xl:text-2xl font-semibold",
  body: "text-base sm:text-lg 3xl:text-xl",
  "body-small": "text-sm sm:text-base 3xl:text-lg",
  small: "text-xs sm:text-sm 3xl:text-md",
  xs: "text-[0.5em] sm:text-[0.7em] 3xl:text-base",
  "h1-alt": "text-3xl sm:text-8xl",
  "h2-alt": "text-xl sm:text-5xl",
  "h3-alt": "text-xs sm:text-2xl",
  alternate: "text-xs sm:text-lg 3xl:text-xl",
  primary: "text-base",
  secondary: "text-base",
  success: "text-base",
  danger: "text-base",
};

const styles: Record<TextVariant, string> = {
  primary: "font-sans antialiased",
  secondary: "font-sans antialiased text-gray-400",
  success: "font-sans antialiased text-green-500",
  danger: "font-sans antialiased text-red-500",
  h1: "",
  h2: "",
  h3: "",
  h4: "",
  h5: "",
  h6: "",
  body: "",
  "body-small": "",
  small: "",
  xs: "",
  alternate: "",
  "h3-alt": "",
  "h2-alt": "",
  "h1-alt": "",
};

export const Text: React.FC<TextProps> = ({
  variant = "primary",
  children,
  className = "",
  as,
  classes = "",
  style = {},
  ...props
}) => {
  const sizeClasses = sizes[variant];
  const Tag = as || tags[variant];
  const textStyle = styles[variant] || styles.primary;
  const finalClass = `${textStyle} ${sizeClasses} ${className} ${classes}`;

  return (
    <Tag className={finalClass} style={style} {...props}>
      {children}
    </Tag>
  );
};
