import {
  FreeAgentOffer,
  League,
  MAX_SALARY,
  MIN_SALARY,
  SimNBA,
  SimNFL,
  SimPHL,
  WaiverOffer,
} from "../_constants/constants";
import {
  NBAContractOffer,
  NBAWaiverOffer,
  NBAExtensionOffer,
  NBACapsheet,
  Timestamp,
} from "../models/basketballModels";
import {
  NFLCapsheet,
  FreeAgencyOffer as NFLFreeAgencyOffer,
  NFLExtensionOffer,
  NFLWaiverOffer,
  Timestamp as FBTimestamp,
} from "../models/footballModels";
import {
  FreeAgencyOffer as PHLFreeAgencyOffer,
  ExtensionOffer as PHLExtensionOffer,
  ProCapsheet,
  Timestamp as HCKTimestamp,
  WaiverOffer as PHLWaiverOffer,
} from "../models/hockeyModels";
import NFLContractEvaluator from "../_matchers/nflContractEvaluator.json";

type ContractEvaluatorMap = {
  [key: string]: Record<string, number>;
};

const NFLContractChecker: ContractEvaluatorMap = NFLContractEvaluator;

export const getPHLSalaryData = (
  offer: PHLFreeAgencyOffer | PHLExtensionOffer,
) => {
  const {
    Y1BaseSalary,
    Y2BaseSalary,
    Y3BaseSalary,
    Y4BaseSalary,
    Y5BaseSalary,
    ContractLength,
    ContractValue,
  } = offer;

  const salaries: number[] = [
    Y1BaseSalary ?? 0,
    Y2BaseSalary ?? 0,
    Y3BaseSalary ?? 0,
    Y4BaseSalary ?? 0,
    Y5BaseSalary ?? 0,
  ].map((s) => (isNaN(s) ? 0 : s));

  const totalComp = salaries.reduce((sum, val, i) => {
    return i < ContractLength ? sum + val : sum;
  }, 0);

  return { Y1BaseSalary, ContractLength, ContractValue, totalComp, salaries };
};

export const getNFLSalaryData = (
  offer: NFLFreeAgencyOffer | NFLExtensionOffer,
) => {
  const {
    Y1BaseSalary,
    Y2BaseSalary,
    Y3BaseSalary,
    Y4BaseSalary,
    Y5BaseSalary,
    Y1Bonus,
    Y2Bonus,
    Y3Bonus,
    Y4Bonus,
    Y5Bonus,
    ContractLength,
    ContractValue,
    AAV,
  } = offer;

  const salaries: number[] = [
    Y1BaseSalary ?? 0,
    Y2BaseSalary ?? 0,
    Y3BaseSalary ?? 0,
    Y4BaseSalary ?? 0,
    Y5BaseSalary ?? 0,
  ].map((s) => (isNaN(s) ? 0 : s));

  const bonuses: number[] = [
    Y1Bonus ?? 0,
    Y2Bonus ?? 0,
    Y3Bonus ?? 0,
    Y4Bonus ?? 0,
    Y5Bonus ?? 0,
  ].map((s) => (isNaN(s) ? 0 : s));

  const totalBonus = bonuses.reduce((sum, val, i) => {
    return i < ContractLength ? sum + val : sum;
  }, 0);

  const totalSalaries = salaries.reduce((sum, val, i) => {
    return i < ContractLength ? sum + val : sum;
  }, 0);

  const totalComp = totalBonus + totalSalaries;

  return {
    Y1BaseSalary,
    ContractLength,
    ContractValue,
    totalComp,
    totalBonus,
    totalSalaries,
    salaries,
    bonuses,
    AAV,
  };
};

export const getNBASalaryData = (
  offer: NBAContractOffer | NBAExtensionOffer,
) => {
  const {
    Year1Total,
    Year2Total,
    Year3Total,
    Year4Total,
    Year5Total,
    TotalYears,
    ContractValue,
  } = offer;

  const salaries: number[] = [
    Year1Total ?? 0,
    Year2Total ?? 0,
    Year3Total ?? 0,
    Year4Total ?? 0,
    Year5Total ?? 0,
  ].map((s) => (isNaN(s) ? 0 : s));

  const totalComp = salaries.reduce((sum, val, i) => {
    return i < TotalYears ? sum + val : sum;
  }, 0);

  return {
    Year1Total,
    Year2Total,
    Year3Total,
    Year4Total,
    Year5Total,
    TotalYears,
    ContractValue,
    totalSalaries: totalComp,
    salaries,
  };
};

const getFirstHalfAAV = (
  salaries: number[],
  contractLength: number,
): number => {
  if (contractLength === 0) return 0;

  const half = Math.floor(contractLength / 2);
  const isOdd = contractLength % 2 === 1;

  let total = 0;
  for (let i = 0; i < half; i++) {
    total += salaries[i];
  }

  if (isOdd) {
    total += salaries[half] / 2;
    return total / (half + 0.5);
  }

  return total / half;
};

const validateYearlySalaryRange = (
  salaries: number[],
  min: number,
  max: number,
): string[] => {
  const errs: string[] = [];
  salaries.forEach((salary, index) => {
    let s = salary || 0;
    if (!salary) {
      s = 0;
    }
    const year = index + 1;
    if (s > 0 && s < min) {
      errs.push(`Y${year} Base Salary is less than the minimum: ${s}`);
    }
    if (salary > max) {
      errs.push(`Y${year} Base Salary is greater than the maximum: ${s}`);
    }
  });
  return errs;
};

const validateYearCap = (
  year: number,
  salary: number,
  teamCap: number,
  capLimit: number,
): string | null => {
  const total = salary + teamCap;
  if (total > capLimit) {
    return `Year ${year} cap exceeded by ${(total - capLimit).toFixed(2)}.`;
  }
  return null;
};

export const ValidateNFLRule2 = (
  len: number,
  y1: number,
  y2: number,
  y3: number,
  y4: number,
  y5: number,
): boolean => {
  if (len === 1) return true;
  const diffs = [y2 - y1, y3 - y2, y4 - y3, y5 - y4].slice(0, len - 1);
  return Math.min(...diffs) >= 0;
};

export const ValidateNFLRule3 = (
  len: number,
  y1: number,
  y2: number,
  y3: number,
  y4: number,
  y5: number,
): boolean => {
  if (len === 1) return true;
  const ys = [y1, y2, y3, y4, y5];
  // percent diffs
  const pctDiffs = ys.slice(1, len).map((y, i) => y / ys[i] - 1);
  const maxPct = Math.max(...pctDiffs);
  // absolute diffs
  const absDiffs = ys.slice(1, len).map((y, i) => y - ys[i]);
  const maxAbs = Math.max(...absDiffs);
  return maxPct <= 0.5 || maxAbs <= 3;
};

export const ValidateNFLRule4 = (
  len: number,
  y1: number,
  y2: number,
  y3: number,
  y4: number,
  y5: number,
): boolean => {
  if (len === 1) return true;
  const ys = [y1, y2, y3, y4, y5].slice(0, len);
  const max = Math.max(...ys);
  // percentage of max
  const percs = ys.map((y) => y / max);
  const minPerc = Math.min(...percs);
  // difference from max
  const diffs = ys.map((y) => max - y);
  const maxDiff = Math.max(...diffs);
  return minPerc >= 0.5 || maxDiff <= 6;
};

export const ValidateNFLRule5 = (
  bonus: number,
  total: number,
  isOffseason: boolean,
): boolean => {
  if (!isOffseason) {
    if (total > 5) {
      return bonus / total >= 0.3;
    }
    return true;
  }
  return bonus / total >= 0.3;
};

export const ValidateNFLRule6 = (
  s1: number,
  s2: number,
  s3: number,
  s4: number,
  s5: number,
  len: number,
): boolean => {
  const sats = [s1, s2, s3, s4, s5];
  for (let i = 0; i < len; i++) {
    const sal = sats[i];
    if (sal !== 0 && sal < 0.5) {
      return false;
    }
  }
  return true;
};

export const ValidateNBARule1 = (
  totalYears: number,
  playerYear: number,
): boolean => {
  if (playerYear < 4) {
    return totalYears > 0 && totalYears < 4;
  }
  return totalYears > 0 && totalYears < 6;
};

export const ValidateNBARule2 = (
  len: number,
  y1: number,
  y2: number,
  y3: number,
  y4: number,
  y5: number,
): boolean => {
  if (len === 5) return true;
  if (len === 4 && y5 === 0) return true;
  if (len === 3 && y4 === 0 && y5 === 0) return true;
  if (len === 2 && y3 === 0 && y4 === 0 && y5 === 0) return true;
  if (len === 1 && y2 === 0 && y3 === 0 && y4 === 0 && y5 === 0) return true;
  return false;
};

export const ValidateNBARule3 = (
  len: number,
  y1: number,
  y2: number,
  y3: number,
  y4: number,
  y5: number,
): boolean => {
  if (len === 1 && !y2 && !y3 && !y4 && !y5) return true;
  if (len === 2 && !y3 && !y4 && !y5 && !y1) return true;
  if (len === 3 && !y2 && !y4 && !y5 && !y1) return true;
  if (len === 4 && !y2 && !y3 && !y5 && !y1) return true;
  if (len === 5 && !y2 && !y4 && !y4 && !y1) return true;
  return false;
};

export const ValidateNBARule4 = (
  len: number,
  y1: number,
  y2: number,
  y3: number,
  y4: number,
  y5: number,
  min: number,
): boolean => {
  if (len === 1) return y1 >= min;
  if (len === 2) return y2 >= min && y1 >= min;
  if (len === 3) return y3 >= min && y2 >= min && y1 >= min;
  if (len === 4) return y4 >= min && y3 >= min && y2 >= min && y1 >= min;
  if (len === 5)
    return y5 >= min && y4 >= min && y3 >= min && y2 >= min && y1 >= min;
  return false;
};

export const ValidateNBARule5 = (
  len: number,
  y1: number,
  y2: number,
  y3: number,
  y4: number,
  y5: number,
  ovr: number,
  maxQualified: boolean,
): boolean => {
  if (len === 1) return true;
  let check2 = true;
  let check3 = true;
  let check4 = true;
  let check5 = true;
  if (len > 4 && !maxQualified) {
    check5 = checkYearlyRange(y4, y5, ovr);
  }
  if (len > 3 && !maxQualified) {
    check4 = checkYearlyRange(y3, y4, ovr);
  }
  if (len > 2 && !maxQualified) {
    check3 = checkYearlyRange(y2, y3, ovr);
  }
  if (len > 1 && !maxQualified) {
    check2 = checkYearlyRange(y1, y2, ovr);
  }

  return check2 && check3 && check4 && check5;
};

const checkYearlyRange = (val1: number, val2: number, ovr: number): boolean => {
  const minRaise = 1.05 * val1;
  return val2 >= minRaise;
};

export const GeneratePHLFAErrorList = (
  offer: PHLFreeAgencyOffer | PHLExtensionOffer,
  ts: HCKTimestamp,
  capsheet: ProCapsheet,
): string[] => {
  const errors: string[] = [];
  const { salaries, ContractLength, ContractValue, totalComp, Y1BaseSalary } =
    getPHLSalaryData(offer);

  const firstHalfAAV = getFirstHalfAAV(salaries, ContractLength);

  const isFrontLoaded = firstHalfAAV > ContractValue;

  if (isFrontLoaded) {
    // --- Front-loaded contract rules ---

    const y1Comp = salaries[0];
    const maxDiff = y1Comp * 0.25;
    const maxYear = Math.max(...salaries);
    const minAllowed = maxYear * 0.6;

    for (let i = 0; i < ContractLength; i++) {
      const current = salaries[i];

      if (current < minAllowed) {
        errors.push(
          `Year ${
            i + 1
          } compensation (${current}) is less than 60% of the highest compensated year (${maxYear}).`,
        );
      }

      // Check diff with previous year
      if (i > 0) {
        const prev = salaries[i - 1];
        const diff = Math.abs(current - prev);
        if (diff > maxDiff) {
          errors.push(
            `Year-to-year compensation change from Year ${i} to ${
              i + 1
            } (${diff}) exceeds 25% of Year 1 (${maxDiff}).`,
          );
        }
      }
    }
  } else {
    // --- Back-loaded contract rules ---

    const y1 = salaries[0];
    const y2 = salaries[1] ?? 0;
    const minY1Y2 = Math.min(y1, y2);

    if (y2 > y1 * 2) {
      errors.push(`Year 2 compensation (${y2}) exceeds double Year 1 (${y1}).`);
    }

    for (let i = 2; i < ContractLength; i++) {
      const prev = salaries[i - 1];
      const curr = salaries[i];
      const increase = curr - prev;

      if (increase > 0 && increase > minY1Y2) {
        errors.push(
          `Year ${
            i + 1
          } increase (${increase}) exceeds the allowed limit based on Year 1 and 2 (${minY1Y2}).`,
        );
      }

      if (increase < 0 && Math.abs(increase) > minY1Y2 * 0.5) {
        errors.push(
          `Year ${i + 1} decrease (${Math.abs(
            increase,
          )}) exceeds 50% of min(Year 1, 2): ${minY1Y2 * 0.5}.`,
        );
      }
    }
  }

  const isSalaryBeyondLength = salaries
    .slice(ContractLength)
    .some((salary) => salary > 0);

  if (isSalaryBeyondLength) {
    errors.push(
      "Contract has salary allocated beyond the specified length of contract.",
    );
  }

  if (ContractLength > 0 && totalComp === 0) {
    errors.push(
      "Contract length is greater than 0, but no yearly salary has been entered.",
    );
  }

  errors.push(...validateYearlySalaryRange(salaries, MIN_SALARY, MAX_SALARY));

  const capError = validateYearCap(
    1,
    Y1BaseSalary,
    capsheet.Y1Salary,
    ts.Y1Capspace,
  );
  if (capError) errors.push(capError);

  return errors;
};

export const GenerateNFLFAErrorList = (
  offer: NFLExtensionOffer | NFLFreeAgencyOffer,
  ts: FBTimestamp,
  capsheet: NFLCapsheet,
  playerAAV: number,
  offerAAV: number,
): string[] => {
  const errors: string[] = [];
  const {
    salaries,
    bonuses,
    ContractLength,
    ContractValue,
    totalComp,
    totalBonus,
    totalSalaries,
    Y1BaseSalary,
  } = getNFLSalaryData(offer);

  const isSalaryBeyondLength = salaries
    .slice(ContractLength)
    .some((salary) => salary > 0);

  const isBonusBeyondLength = bonuses
    .slice(ContractLength)
    .some((bonus) => bonus > 0);

  if (isSalaryBeyondLength) {
    errors.push(
      "Contract has salary allocated beyond the specified length of contract.",
    );
  }

  if (isBonusBeyondLength) {
    errors.push(
      "Contract has bonus allocated beyond the specified length of contract.",
    );
  }

  if (ContractLength > 0 && totalComp === 0) {
    errors.push(
      "Contract length is greater than 0, but no yearly salary has been entered.",
    );
  }

  const capError = validateYearCap(
    1,
    Y1BaseSalary,
    capsheet.Y1Salary,
    ts.Y1Capspace,
  );
  if (capError) errors.push(capError);

  // shortcut references
  const [y1, y2, y3, y4, y5] = salaries;

  // 4) Rule2: salary can’t decrease year-over-year
  if (!ValidateNFLRule2(ContractLength, y1, y2, y3, y4, y5)) {
    errors.push("Salary cannot decrease (but can remain flat) year-over-year.");
  }

  // 5) Rule3: no huge jumps (>50% or >$3M)
  if (!ValidateNFLRule3(ContractLength, y1, y2, y3, y4, y5)) {
    errors.push("Year-to-year increases must be ≤50% or ≤$3 million.");
  }

  // 6) Rule4: highest year cannot be more than 100% of lowest (or $6M)
  if (!ValidateNFLRule4(ContractLength, y1, y2, y3, y4, y5)) {
    errors.push(
      "Highest year cannot exceed 100% of the lowest year (or $6 million difference).",
    );
  }

  // 7) Rule6: any non-zero salary must be ≥ $0.5M
  if (!ValidateNFLRule6(y1, y2, y3, y4, y5, ContractLength)) {
    errors.push("Any non-zero salary must be at least $0.5 million.");
  }

  if (playerAAV > offerAAV) {
    errors.push(
      `The offered AAV (${offerAAV}) is lower than the player's expected AAV (${playerAAV})`,
    );
  }

  // 8) Rule5: bonus % rules around draft
  const isOffseason = ts.IsOffSeason;
  if (!ValidateNFLRule5(totalBonus, totalComp, isOffseason)) {
    if (isOffseason) {
      errors.push(
        "Before the NFL Draft, at least 30% of any contract must be bonus money.",
      );
    } else {
      errors.push(
        "After the NFL Draft, if total compensation is over $5 million, at least 30% must be bonus money.",
      );
    }
  }

  return errors;
};

export const GenerateNBAFAErrorList = (
  offer: NBAExtensionOffer | NBAContractOffer,
  ts: Timestamp,
  capsheet: NBACapsheet,
  playerAAV: number,
  offerAAV: number,
): string[] => {
  const errors: string[] = [];
  const { salaries, TotalYears, ContractValue, totalSalaries, Year1Total } =
    getNBASalaryData(offer);

  const isSalaryBeyondLength = salaries
    .slice(TotalYears)
    .some((salary) => salary > 0);

  if (isSalaryBeyondLength) {
    errors.push(
      "Contract has salary allocated beyond the specified length of contract.",
    );
  }

  if (TotalYears > 0 && totalSalaries === 0) {
    errors.push(
      "Contract length is greater than 0, but no yearly salary has been entered.",
    );
  }

  const capError = validateYearCap(
    1,
    Year1Total,
    capsheet.Year1Total,
    ts.Y1Capspace,
  );
  if (capError) errors.push(capError);

  // shortcut references
  const [y1, y2, y3, y4, y5] = salaries;

  // 4) Rule2: salary can’t decrease year-over-year
  if (!ValidateNBARule2(TotalYears, y1, y2, y3, y4, y5)) {
    errors.push("Salary cannot decrease (but can remain flat) year-over-year.");
  }

  // 5) Rule3: no huge jumps (>50% or >$3M)
  if (!ValidateNBARule3(TotalYears, y1, y2, y3, y4, y5)) {
    errors.push("Year-to-year increases must be ≤50% or ≤$3 million.");
  }

  // 6) Rule4: highest year cannot be more than 100% of lowest (or $6M)
  if (!ValidateNBARule4(TotalYears, y1, y2, y3, y4, y5, 0.5)) {
    errors.push(
      "Highest year cannot exceed 100% of the lowest year (or $6 million difference).",
    );
  }

  if (playerAAV > offerAAV) {
    errors.push(
      `The offered AAV (${offerAAV}) is lower than the player's expected AAV (${playerAAV})`,
    );
  }

  return errors;
};

export const createOffer = (
  league: League,
  action: string,
  existingOffer?:
    | PHLFreeAgencyOffer
    | PHLWaiverOffer
    | NFLFreeAgencyOffer
    | NFLWaiverOffer
    | NBAContractOffer
    | NBAWaiverOffer,
) => {
  const props = existingOffer ? { ...existingOffer } : undefined;

  if (league === SimNFL && action === FreeAgentOffer) {
    return new NFLFreeAgencyOffer(props);
  }
  if (league === SimNFL && action === WaiverOffer) {
    return new NFLWaiverOffer(props);
  }
  if (league === SimNBA && action === FreeAgentOffer) {
    return new NBAContractOffer(props);
  }
  if (league === SimNBA && action === WaiverOffer) {
    return new NBAWaiverOffer(props);
  }
  if (league === SimPHL && action === WaiverOffer) {
    return new PHLWaiverOffer(props);
  }
  return new PHLFreeAgencyOffer(props);
};

export const createExtensionOffer = (
  league: League,
  existingOffer?: PHLExtensionOffer | NFLExtensionOffer | NBAExtensionOffer,
) => {
  const props = existingOffer ? { ...existingOffer } : undefined;

  if (league === SimNFL) {
    return new NFLExtensionOffer(props);
  }
  if (league === SimNBA) {
    return new NBAExtensionOffer(props);
  }
  if (league === SimPHL) {
    return new PHLExtensionOffer(props);
  }
  return new PHLExtensionOffer(props);
};

export const GetNFLContractValue = (
  age: number,
  offer: NFLFreeAgencyOffer | NFLExtensionOffer,
) => {
  const {
    Y1Bonus,
    Y2Bonus,
    Y3Bonus,
    Y4Bonus,
    Y5Bonus,
    Y1BaseSalary,
    Y2BaseSalary,
    Y3BaseSalary,
    Y4BaseSalary,
    Y5BaseSalary,
  } = offer;
  const ageStr = `${age}`;
  const modifiers = NFLContractChecker[ageStr];
  const { Y1B, Y1S, Y2B, Y2S, Y3B, Y3S, Y4B, Y4S, Y5B, Y5S } = modifiers;
  let total = 0;
  if (Y1Bonus) {
    const y1Bonus = Y1Bonus * Y1B;
    total += y1Bonus;
  }
  if (Y1BaseSalary) {
    const y1Salary = offer.Y1BaseSalary * Y1S;
    total += y1Salary;
  }
  if (Y2Bonus) {
    const y2Bonus = Y2Bonus * Y2B;
    total += y2Bonus;
  }
  if (Y2BaseSalary) {
    const y2Salary = offer.Y2BaseSalary * Y2S;
    total += y2Salary;
  }
  if (Y3Bonus) {
    const y3Bonus = Y3Bonus * Y3B;
    total += y3Bonus;
  }
  if (Y3BaseSalary) {
    const y3Salary = offer.Y3BaseSalary * Y3S;
    total += y3Salary;
  }
  if (Y4Bonus) {
    const y4Bonus = Y4Bonus * Y4B;
    total += y4Bonus;
  }
  if (Y4BaseSalary) {
    const y4Salary = offer.Y4BaseSalary * Y4S;
    total += y4Salary;
  }
  if (Y5Bonus) {
    const y5Bonus = Y5Bonus * Y5B;
    total += y5Bonus;
  }
  if (Y5BaseSalary) {
    const y5Salary = offer.Y5BaseSalary * Y5S;
    total += y5Salary;
  }

  return total;
};

export const GetNBAContractValue = (
  offer: NBAContractOffer | NBAExtensionOffer,
) => {
  const { Year1Total, Year2Total, Year3Total, Year4Total, Year5Total } = offer;
  let total = 0;
  if (Year1Total) {
    const y1Total = Year1Total;
    total += y1Total;
  }
  if (Year2Total) {
    const y2Total = Year2Total;
    total += y2Total;
  }
  if (Year3Total) {
    const y3Total = Year3Total;
    total += y3Total;
  }
  if (Year4Total) {
    const y4Total = Year4Total;
    total += y4Total;
  }
  if (Year5Total) {
    const y5Total = Year5Total;
    total += y5Total;
  }

  return total;
};

export const GetNFLAAVValue = (total: number, length: number) => {
  return total / length;
};
