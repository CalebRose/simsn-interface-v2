import { isBrightColor } from "../../../_utility/isBrightColor";

/**
 * Lighten a hex color by mixing it toward white.
 * amount: 0 = original, 1 = white
 */
function lightenHex(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

/**
 * Check if a color is very dark (low luminance).
 */
function isDarkColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 80;
}

/**
 * Returns an inline style for stats table header rows that is always readable.
 *
 * Handles three cases:
 *  - Bright accent (yellow, lime) → dark gray text, slightly stronger tinted bg
 *  - Dark accent (navy, black) → lightened accent text in dark mode
 *  - Mid-range accent → accent text works as-is in both modes
 */
export function getStatsHeaderStyle(
  accentColor?: string,
  isDarkMode?: boolean,
): React.CSSProperties | undefined {
  if (!accentColor) return undefined;

  const bright = isBrightColor(accentColor);
  const dark = isDarkColor(accentColor);

  if (bright) {
    return isDarkMode
      ? { backgroundColor: `${accentColor}20`, color: lightenHex(accentColor, 0.3) }
      : { backgroundColor: `${accentColor}20`, color: "#374151" }; // gray-700
  }

  if (dark) {
    return isDarkMode
      ? { backgroundColor: `${accentColor}25`, color: lightenHex(accentColor, 0.55) }
      : { backgroundColor: `${accentColor}15`, color: accentColor };
  }

  // Mid-range: accent text is readable on both light & dark backgrounds
  return isDarkMode
    ? { backgroundColor: `${accentColor}20`, color: accentColor }
    : { backgroundColor: `${accentColor}15`, color: accentColor };
}
