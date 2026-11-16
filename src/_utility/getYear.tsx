export const getYear = (year: number, isRedshirt?: boolean): string => {
  switch (year) {
    case 1:
      return "Fr";
    case 2:
      return "So";
    case 3:
      return "Jr";
    case 4:
      return "Sr";
    case 5:
      return "5th";
    default:
      return "N/A";
  }
};
