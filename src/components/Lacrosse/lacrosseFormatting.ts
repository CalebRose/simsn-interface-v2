const yearNames: Record<number, string> = { 1: "Freshman", 2: "Sophomore", 3: "Junior", 4: "Senior", 5: "5th Year" };
const yearAbbreviations: Record<number, string> = { 1: "Fr", 2: "So", 3: "Jr", 4: "Sr", 5: "5th" };
export const LACROSSE_FIRST_SEASON_YEAR = 2026;
const gradeColors: Record<string, string> = {
  "A+": "#00ACC9", A: "#00A995", "A-": "#00A666",
  "B+": "#64B052", B: "#AEBA3F", "B-": "#D7C12C",
  "C+": "#F1C51A", C: "#FDC70D", "C-": "#FCBF15",
  "D+": "#F8AC23", D: "#F18831", "D-": "#EA5139", F: "#AC2B27",
};

export const getLacrosseYearName = (year: number) => yearNames[year] || String(year);
export const getLacrosseYearAbbreviation = (year: number) => yearAbbreviations[year] || String(year);
export const getLacrosseGradeColor = (grade: string) => gradeColors[grade] || gradeColors.F;
export const getLacrosseSeasonYear = (seasonId: number) => LACROSSE_FIRST_SEASON_YEAR + seasonId - 1;
