export const darkenColor = (
  color: string,
  percent: number,
  isLightMode?: boolean
): string => {
  const num = parseInt(color.replace("#", ""), 16);

  // In light mode, invert the darkening to lightening for better visibility
  let adjustedPercent = percent;
  if (isLightMode) {
    // In light mode, convert darkening to lightening and make it more subtle
    adjustedPercent = percent > 0 ? -Math.abs(percent * 0.5) : percent;
    // Clamp the lightening to prevent too bright colors
    adjustedPercent = Math.max(adjustedPercent, -20);
  }

  const amt = Math.round(2.55 * adjustedPercent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

// Theme-aware wrapper function
export const getThemeAwareDarkenColor = (
  color: string,
  percent: number
): string => {
  const isLightMode =
    document.documentElement.classList.contains("light") ||
    !document.documentElement.classList.contains("dark");
  return darkenColor(color, percent, isLightMode);
};
