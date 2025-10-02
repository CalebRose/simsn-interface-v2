export const getYear = (year: number, isRedshirt: boolean): string => {
  if (year === 0) return "N/A";
  if (year === 1 && !isRedshirt) return "Fr";
  if (year === 2 && isRedshirt) return "(Fr)";
  if (year === 2 && !isRedshirt) return "So";
  if (year === 3 && isRedshirt) return "(So)";
  if (year === 3 && !isRedshirt) return "Jr";
  if (year === 4 && isRedshirt) return "(Jr)";
  if (year === 4 && !isRedshirt) return "Sr";
  return "(Sr)";
};
