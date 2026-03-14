/**
 * Baseball rating color configuration.
 * Adjust thresholds and colors here to change colors across all baseball UI.
 */

// Numeric 20-80 scale colors
export const ratingColor = (v: number): string => {
  if (v >= 70) return "text-green-600 dark:text-green-400 font-semibold";
  if (v >= 60) return "text-blue-600 dark:text-blue-400";
  if (v >= 50) return "";
  if (v >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

// Letter grade colors (A-F)
export const gradeColor = (grade: string): string => {
  if (grade.startsWith("A")) return "text-green-600 dark:text-green-400";
  if (grade.startsWith("B")) return "text-blue-600 dark:text-blue-400";
  if (grade.startsWith("C")) return "text-yellow-600 dark:text-yellow-400";
  if (grade.startsWith("D")) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

// Potential letter grade colors (separated for independent tuning)
export const potColor = gradeColor;
