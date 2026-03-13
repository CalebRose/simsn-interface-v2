import {
  attributeAverages,
  Attributes as cfbAttributes,
  PositionAttributes,
} from "../_constants/attributeAverages";

export const getGeneralLetterGrade = (attr: number): string => {
  if (attr > 85) {
    return "A+";
  } else if (attr > 75) {
    return "A";
  } else if (attr > 70) {
    return "A-";
  } else if (attr > 65) {
    return "B+";
  } else if (attr > 60) {
    return "B";
  } else if (attr > 55) {
    return "B-";
  } else if (attr > 50) {
    return "C+";
  } else if (attr > 40) {
    return "C";
  } else if (attr > 35) {
    return "C-";
  } else if (attr > 30) {
    return "D+";
  } else if (attr > 25) {
    return "D";
  } else if (attr > 20) {
    return "D-";
  }
  return "F";
};

export const getHockeyLetterGrade = (attr: number, year: number): string => {
  if (year < 3) {
    if (attr > 18) {
      return "A";
    }
    if (attr > 12) {
      return "B";
    }
    if (attr > 7) {
      return "C";
    }
    if (attr > 4) {
      return "D";
    }
    return "F";
  }
  if (attr > 24) {
    return "A+";
  }
  if (attr > 21) {
    return "A";
  }
  if (attr > 18) {
    return "A-";
  }
  if (attr > 16) {
    return "B+";
  }
  if (attr > 14) {
    return "B";
  }
  if (attr > 12) {
    return "B-";
  }
  if (attr > 10) {
    return "C+";
  }
  if (attr > 8) {
    return "C";
  }
  if (attr > 6) {
    return "C-";
  }
  if (attr > 4) {
    return "D";
  }
  return "F";
};

interface Attributes {
  mean: number;
  stddev: number;
}

export const getCFBLetterGrade = (
  attrName: keyof cfbAttributes,
  position: keyof PositionAttributes,
  value: number,
  year: number,
): string => {
  const y = Number(year);
  const attrData = attributeAverages[attrName][position];
  if (attrData === undefined) return "F";
  const { mean, stddev } = attrData;

  if (y < 3) {
    let dev = stddev * 2;
    if (value > mean + dev) {
      return "A";
    }
    dev = stddev * 1;
    if (value > mean + dev) {
      return "B";
    }
    if (value > mean) {
      return "C";
    }
    dev = stddev * -1;
    if (value > mean + dev) {
      return "D";
    }
  } else {
    let dev = stddev * 2.5;
    if (value > mean + dev) {
      return "A+";
    }
    dev = stddev * 2;
    if (value > mean + dev) {
      return "A";
    }
    dev = stddev * 1.75;
    if (value > mean + dev) {
      return "A-";
    }
    dev = stddev * 1.5;
    if (value > mean + dev) {
      return "B+";
    }
    dev = stddev * 1;
    if (value > mean + dev) {
      return "B";
    }
    dev = stddev * 0.75;
    if (value > mean + dev) {
      return "B-";
    }
    dev = stddev * 0.5;
    if (value > mean + dev) {
      return "C+";
    }
    if (value > mean) {
      return "C";
    }
    dev = stddev * -0.5;
    if (value > mean + dev) {
      return "C-";
    }
    dev = stddev * -0.75;
    if (value > mean + dev) {
      return "D+";
    }
    dev = stddev * -1;
    if (value > mean + dev) {
      return "D";
    }
    dev = stddev * -1.5;
    if (value > mean + dev) {
      return "D-";
    }
  }

  return "F";
};

export const getCFBOverall = (ovr: number, year: number) => {
  if (typeof ovr === "string") return ovr;
  if (year < 3) {
    if (ovr > 44) return "A";
    else if (ovr > 34) return "B";
    else if (ovr > 24) return "C";
    else if (ovr > 14) return "D";
  } else {
    if (ovr > 47) return "A";
    else if (ovr > 44) return "A-";
    else if (ovr > 40) return "B+";
    else if (ovr > 37) return "B";
    else if (ovr > 34) return "B-";
    else if (ovr > 30) return "C+";
    else if (ovr > 27) return "C";
    else if (ovr > 24) return "C-";
    else if (ovr > 20) return "D+";
    else if (ovr > 17) return "D";
    else if (ovr > 14) return "D-";
  }
  return "F";
};

export const getCBBLetterGrade = (attr: number, year: number): string => {
  if (year < 3) {
    if (attr > 23) {
      return "A";
    }
    if (attr > 18) {
      return "B";
    }
    if (attr > 10) {
      return "C";
    }
    if (attr > 5) {
      return "D";
    }
    return "F";
  }
  if (attr > 29) {
    return "A+";
  }
  if (attr > 26) {
    return "A";
  }
  if (attr > 23) {
    return "A-";
  }
  if (attr > 20) {
    return "B+";
  }
  if (attr > 17) {
    return "B";
  }
  if (attr > 14) {
    return "B-";
  }
  if (attr > 11) {
    return "C+";
  }
  if (attr > 8) {
    return "C";
  }
  if (attr > 5) {
    return "C-";
  }
  if (attr > 2) {
    return "D";
  }
  return "F";
};

export const getCBBOverall = (ovr: number, year: number) => {
  if (ovr > 69) {
    return "A";
  }
  if (ovr > 56) {
    return "B";
  }
  if (ovr > 48) {
    return "C";
  }
  if (ovr > 36) {
    return "D";
  }
  return "F";
};
