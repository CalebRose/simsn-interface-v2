export const GenerateNumberFromRange = (min: number, max: number): number => {
  if (min > max) {
    // Swap min and max if min is greater than max
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getPlayerMoraleLabel = (value: number) => {
  if (value > 95) {
    return "Excellent";
  }
  if (value > 85) {
    return "Very Good";
  }
  if (value > 70) {
    return "Good";
  }
  if (value > 55) {
    return "Average";
  }
  if (value > 40) {
    return "Not Good";
  }
  if (value > 25) {
    return "Awful";
  }
  return "Bad";
};

export const getAcademicsLabel = (value: number) => {
  switch (value) {
    case 1:
      return "Clearly not here for school";
    case 2:
      return "Failing";
    case 3:
      return "Class Clown";
    case 4:
      return "C's Get Degrees";
    case 5:
      return "Average";
    case 6:
      return "Studious";
    case 7:
      return "Often in the Library";
    case 8:
      return "Teacher's Pet";
    case 9:
      return "Likely to Pursue a Master's";
    default:
      return "Distracted";
  }
};

export const getCompetitivenessLabel = (value: number) => {
  switch (value) {
    case 1:
      return "Lazy";
    case 2:
      return "Slacker";
    case 3:
      return "Milquetoast";
    case 4:
      return "Needs Motivation";
    case 5:
      return "Average";
    case 6:
      return "Focused";
    case 7:
      return "Engrossed";
    case 8:
      return "Fierce";
    case 9:
      return "Cutthroat";
    default:
      return "Distracted";
  }
};

export const getTeamLoyaltyLabel = (value: number) => {
  switch (value) {
    case 1:
      return "Apathetic";
    case 2:
      return "Wavering";
    case 3:
      return "Fickle";
    case 4:
      return "Uninterested";
    case 5:
      return "Average";
    case 6:
      return "Dependable";
    case 7:
      return "Trusted";
    case 8:
      return "Devoted";
    case 9:
      return "Unwavering";
    default:
      return "Distracted";
  }
};

export const getPlaytimePreferenceLabel = (value: number) => {
  switch (value) {
    case 1:
      return "Complacent";
    case 2:
      return "Patient";
    case 3:
      return "Passive";
    case 4:
      return "Uninterested";
    case 5:
      return "Average";
    case 6:
      return "Avid";
    case 7:
      return "Driven";
    case 8:
      return "Ambitious";
    case 9:
      return "Zealous";
    default:
      return "Distracted";
  }
};

export const getFAMarketPreference = (value: number): string => {
  const valueMap: Record<number, string> = {
    1: "Average",
    2: "Close to Home",
    3: "Countrymen",
    4: "Large Market",
    5: "No Large Market",
    6: "Small Market",
    7: "No Small Market",
    8: "Loyal to Team",
    9: "Avoiding Prev. Team",
  };
  return valueMap[value];
};

export const getFACompetitivePreference = (value: number): string => {
  const valueMap: Record<number, string> = {
    1: "Average",
    2: "Seeking Mentorship",
    3: "Veteran Mentor",
    4: "First Line",
    5: "Second Line",
    6: "Competitive Team",
  };
  return valueMap[value];
};

export const getFAFinancialPreference = (value: number): string => {
  const valueMap: Record<number, string> = {
    1: "Average",
    2: "Short Contract",
    3: "Long Contract",
    4: "Large AAV",
  };
  return valueMap[value];
};

export const GetNextGameDay = (
  gamesARan: boolean,
  gamesBRan: boolean,
  gamesCRan: boolean,
) => {
  let nextGameDay = "A";
  if (gamesARan) {
    nextGameDay = "B";
  }
  if (gamesBRan) {
    nextGameDay = "C";
  }
  if (gamesCRan) {
    nextGameDay = "D";
  }

  return nextGameDay;
};

export const ConvertTimeOnIce = (toi: number) => {
  return Math.floor(toi / 60);
};

export const getTagTypeEnum = (tagType: string) => {
  switch (tagType) {
    case "Basic":
      return 0;
    case "Playtime":
      return 3;
    case "Transition":
      return 2;
    case "Franchise":
      return 1;
    default:
      return 0;
  }
};
