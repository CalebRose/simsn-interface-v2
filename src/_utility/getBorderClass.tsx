// ✅ Variant and Theme Types
type Variant = "success" | "danger" | "warning";
type Theme = "light" | "dark";

/**
 * ✅ Returns a gradient border class based on condition, variant, and theme.
 */
export const GetGradientBorderClass = (
  bool: boolean,
  variant: Variant,
  theme: Theme,
): string => {
  const baseColor = theme === "light" ? "gray-200" : "gray-700";
  const variantColors: Record<Variant, string> = {
    success: "green-500",
    danger: "red-500",
    warning: "yellow-500",
  };

  const color = bool ? variantColors[variant] : baseColor;
  const gradientMap: Record<string, string> = {
    "green-500": "bg-linear-to-b from-green-500",
    "red-500": "bg-linear-to-b from-red-500",
    "yellow-500": "bg-linear-to-b from-yellow-500",
    "gray-200": "bg-linear-to-b from-gray-200",
    "gray-700": "bg-linear-to-b from-gray-700",
  };
  const toMap: Record<string, string> = {
    "gray-200": "to-gray-200",
    "gray-700": "to-gray-700",
  };
  return `${gradientMap[color] ?? "bg-linear-to-b from-gray-500"} ${toMap[baseColor] ?? "to-gray-500"} bg-clip-padding`;
};

/**
 * ✅ Returns a border class based on variant and theme.
 */
export const GetBorderClass = (variant: Variant | "", theme: Theme): string => {
  const baseColor = theme === "light" ? "gray-200" : "gray-700";
  const variantColors: Record<Variant, string> = {
    success: "green-500",
    danger: "red-500",
    warning: "yellow-500",
  };

  const color = variant ? variantColors[variant] : baseColor;
  const borderColorMap: Record<string, string> = {
    "green-500": "border-green-500",
    "red-500": "border-red-500",
    "yellow-500": "border-yellow-500",
    "gray-200": "border-gray-200",
    "gray-700": "border-gray-700",
  };
  return `border-2 ${borderColorMap[color] ?? "border-gray-500"}`;
};

/**
 * ✅ Returns the text color based on the provided background color.
 */
export const getTextColorBasedOnBg = (bgColor: string = ""): string => {
  if (!bgColor) return "text-black";

  // Remove the # if present
  const hex = bgColor.replace("#", "");

  // Convert HEX to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Return a text color class based on luminance
  return luminance > 0.83
    ? "text-black"
    : luminance > 0.5
      ? "text-gray-800"
      : "text-white";
};
