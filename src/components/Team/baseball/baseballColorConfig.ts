/**
 * Baseball rating color configuration.
 * Single source of truth for coloring attribute rankings across all baseball UI.
 *
 * Gradient (bad → elite): red → orange → yellow → green → blue.
 * 13 tiers, interpolated in HSL space from hand-tuned anchors so the hue and
 * saturation drift smoothly — no preset-palette stair-stepping between tiers.
 *
 * Numeric ratings arrive in increments of 5 on the 20-80 scale.
 * Letter grades (F … A+, including +/- variants) are aligned to the same tiers.
 *
 * Colors are emitted as Tailwind arbitrary-value classes (`text-[#hex]`) so the
 * existing className-based API is preserved. The strings are present as literals
 * in this file so Tailwind's JIT scanner picks them up at build time.
 */

// ── Gradient lookup ───────────────────────────────────────────
// Each tier carries its own light + dark hex, pre-baked into a Tailwind class.
// All tiers are font-semibold so attribute values pop uniformly in tables.
// Tier index: 0 (worst, 20/F) → 12 (best, 80/A+).
const GRADIENT: readonly string[] = [
  "text-[#B81E1E] dark:text-[#EA5353] font-semibold", //  0 — 20 / F
  "text-[#C5341B] dark:text-[#EA6953] font-semibold", //  1 — 25 / F+
  "text-[#CF4E17] dark:text-[#EB7847] font-semibold", //  2 — 30 / D-
  "text-[#E27312] dark:text-[#F3933F] font-semibold", //  3 — 35 / D
  "text-[#E08D10] dark:text-[#F4A734] font-semibold", //  4 — 40 / D+
  "text-[#DCA20E] dark:text-[#F6BC28] font-semibold", //  5 — 45 / C-
  "text-[#D3B20D] dark:text-[#F6D21E] font-semibold", //  6 — 50 / C
  "text-[#9BB616] dark:text-[#CBEA2E] font-semibold", //  7 — 55 / C+
  "text-[#56A31F] dark:text-[#7FDF3A] font-semibold", //  8 — 60 / B-
  "text-[#279B3A] dark:text-[#35D450] font-semibold", //  9 — 65 / B
  "text-[#259D6B] dark:text-[#35D492] font-semibold", // 10 — 70 / B+
  "text-[#20AAB6] dark:text-[#3AD1DF] font-semibold", // 11 — 75 / A-
  "text-[#1A6FE6] dark:text-[#4990F3] font-semibold", // 12 — 80 / A / A+
];

// ── Numeric 20-80 scale (increments of 5) ─────────────────────
export const ratingColor = (v: number): string => {
  if (v == null || Number.isNaN(v)) return "";
  // Clamp to [20, 80] and map to tier index 0..12 in steps of 5.
  const clamped = Math.max(20, Math.min(80, v));
  const idx = Math.round((clamped - 20) / 5);
  return GRADIENT[idx];
};

// ── Letter grade scale (F … A+, including +/- variants) ──────
// Aligned to the numeric gradient so a "B" matches a 65, "C" matches a 50, etc.
const LETTER_TO_TIER: Record<string, number> = {
  "F-": 0,
  "F":  0,
  "F+": 1,
  "D-": 2,
  "D":  3,
  "D+": 4,
  "C-": 5,
  "C":  6,
  "C+": 7,
  "B-": 8,
  "B":  9,
  "B+": 10,
  "A-": 11,
  "A":  12,
  "A+": 12,
};

export const gradeColor = (grade: string): string => {
  if (!grade) return "";
  if (grade.startsWith("?") || grade.startsWith("—")) return "";

  const tier = LETTER_TO_TIER[grade];
  if (tier !== undefined) return GRADIENT[tier];

  // Fallback: coarse match on the leading letter for unexpected formats.
  switch (grade[0]) {
    case "A": return GRADIENT[12];
    case "B": return GRADIENT[9];
    case "C": return GRADIENT[6];
    case "D": return GRADIENT[3];
    case "F": return GRADIENT[0];
  }
  return GRADIENT[0];
};

// Potential letter grade colors (alias — kept for semantic call-sites)
export const potColor = gradeColor;

// ── Stamina 0-100 scale ───────────────────────────────────────
// Same gradient stretched across 0-100 in 10-point bands (tier 0..10).
export const staminaColor = (v: number): string => {
  if (v == null || Number.isNaN(v)) return "";
  const clamped = Math.max(0, Math.min(100, v));
  // Map 0..100 → tier 1..12 so stamina can still reach the elite blue.
  // Every 9-ish points moves up a tier; the top band (>= 95) hits tier 12.
  const idx = Math.min(12, 1 + Math.floor(clamped / 9));
  return GRADIENT[idx];
};
