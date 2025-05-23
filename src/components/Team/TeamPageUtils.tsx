import {
  Attributes,
  Potentials,
  Preferences,
  Contracts,
  Overview,
} from "../../_constants/constants";
import { HeightToFeetAndInches } from "../../_utility/getHeightByFeetAndInches";
import {
  getGeneralLetterGrade,
  getHockeyLetterGrade,
  getCFBLetterGrade,
  getCFBOverall,
  getCBBLetterGrade,
  getCBBOverall,
} from "../../_utility/getLetterGrade";
import { getYear } from "../../_utility/getYear";
import {
  CollegePlayer as CHLPlayer,
  ProfessionalPlayer as PHLPlayer,
  ProContract as PHLContract,
  Croot,
  DraftPick,
} from "../../models/hockeyModels";
import {
  CollegePlayer as CFBPlayer,
  NFLContract,
  NFLPlayer,
} from "../../models/footballModels";
import {
  Agility,
  Speed,
  Carrying,
  Strength,
  ThrowPower,
  ThrowAccuracy,
  ShotgunRating,
  Catching,
  PassBlock,
  RunBlock,
  RouteRunning,
  Tackle,
  PassRush,
  RunDefense,
  ZoneCoverage,
  ManCoverage,
  KickAccuracy,
  KickPower,
  PuntAccuracy,
  PuntPower,
  FootballIQ,
  Stamina,
  Injury,
} from "../../_constants/constants";
import {
  annotateCountry,
  annotateRegion,
} from "../../_helper/StateAbbreviationHelper";
import {
  getAcademicsLabel,
  getCompetitivenessLabel,
  getFAFinancialPreference,
  getFAMarketPreference,
  getPlayerMoraleLabel,
  getTeamLoyaltyLabel,
} from "../../_helper/utilHelper";
import {
  CollegePlayer as CBBPlayer,
  NBAPlayer,
} from "../../models/basketballModels";
import { TradeBlockRow } from "./TeamPageTypes";

export const getCHLAttributes = (
  player: CHLPlayer,
  isMobile: boolean,
  isTablet: boolean,
  category: string
) => {
  const heightObj = HeightToFeetAndInches(player.Height);
  const attributes = [
    { label: "Name", value: `${player.FirstName} ${player.LastName}` },
    { label: "Pos", value: player.Position },
    { label: "Arch", value: player.Archetype },
    { label: "Yr", value: getYear(player.Year, player.IsRedshirt) },
    { label: "Stars", value: player.Stars },
    { label: "Ovr", value: getHockeyLetterGrade(player.Overall, player.Year) },
  ];

  const overviewAttributes =
    !isMobile && !isTablet && category === Overview
      ? [
          { label: "Health", value: player.IsInjured },
          {
            label: "Injury",
            value: player.InjuryType
              ? player.WeeksOfRecovery && player.WeeksOfRecovery > 0
                ? `${player.InjuryType}, ${player.WeeksOfRecovery} weeks`
                : `None`
              : "None",
          },
          {
            label: "Competitiveness",
            value: getCompetitivenessLabel(player.Competitiveness),
          },
          {
            label: "Academics",
            value: getAcademicsLabel(player.AcademicsPref),
          },
          { label: "Loyalty", value: getTeamLoyaltyLabel(player.TeamLoyalty) },
          {
            label: "PlayerMorale",
            value: getPlayerMoraleLabel(player.PlayerMorale),
          },
          { label: "Redshirt", value: player.IsRedshirting },
          { label: "TransferStatus", value: player.TransferStatus },
        ]
      : [];

  const additionalAttributes =
    (!isMobile || isTablet) && category === Attributes
      ? getAdditionalHockeyAttributes(player)
      : [];

  const potentialAttributes =
    (!isMobile || isTablet) && category === Potentials
      ? getAdditionalPotentialAttributes(player)
      : [];

  return [
    ...attributes,
    ...overviewAttributes,
    ...additionalAttributes,
    ...potentialAttributes,
  ];
};

export const getPHLAttributes = (
  player: PHLPlayer,
  isMobile: boolean,
  isTablet: boolean,
  category: string,
  contract?: any
) => {
  const phlContract = contract as PHLContract;
  const attributes = [
    { label: "Name", value: `${player.FirstName} ${player.LastName}` },
    { label: "Pos", value: player.Position },
    { label: "Arch", value: player.Archetype },
    { label: "Yr", value: player.Year },
    { label: "Ovr", value: player.Overall },
  ];

  const overviewAttributes =
    !isMobile && category === Overview && phlContract
      ? [
          { label: "Health", value: player.IsInjured },
          {
            label: "Injury",
            value: player.InjuryType
              ? player.WeeksOfRecovery && player.WeeksOfRecovery > 0
                ? `${player.InjuryType}, ${player.WeeksOfRecovery} weeks`
                : `None`
              : "None",
          },
          {
            label: "Current Year Salary",
            value: `${contract.Y1BaseSalary.toFixed(2)}M`,
          },
          { label: "Years Left", value: phlContract.ContractLength },
          { label: "NTC", value: contract.NoTradeClause },
          { label: "NMC", value: contract.NoMovementClause },
          {
            label: "TradeBlock",
            value: player.IsOnTradeBlock ? "Yes" : "No",
          },
          {
            label: "Affiliate",
            value: player.IsAffiliatePlayer ? "Yes" : "No",
          },
          {
            label: "Competitiveness",
            value: getCompetitivenessLabel(player.Competitiveness),
          },
          {
            label: "Financial",
            value: getFAFinancialPreference(player.FinancialPreference),
          },
          {
            label: "MarketPref",
            value: getFAMarketPreference(player.MarketPreference),
          },
          { label: "Loyalty", value: getTeamLoyaltyLabel(player.TeamLoyalty) },
          {
            label: "PlayerMorale",
            value: getPlayerMoraleLabel(player.PlayerMorale),
          },
        ]
      : [];

  const additionalAttributes =
    !isMobile && category === Attributes
      ? getAdditionalHockeyAttributes(player).map((attr) => ({
          ...attr,
          letter: attr.value,
          value: attr.raw,
        }))
      : [];

  const contractAttributes =
    !isMobile && category === Contracts && phlContract
      ? getPHLContracts(phlContract)
      : [];

  const potentialAttributes =
    !isMobile && category === Potentials
      ? getAdditionalPotentialAttributes(player)
      : [];

  return [
    ...attributes,
    ...overviewAttributes,
    ...additionalAttributes,
    ...potentialAttributes,
    ...contractAttributes,
  ];
};

export const getPHLContracts = (contract: any) => {
  return [
    { label: "Y1S", value: contract.Y1BaseSalary },
    { label: "Y2S", value: contract.Y2BaseSalary },
    { label: "Y3S", value: contract.Y3BaseSalary },
    { label: "Y4S", value: contract.Y4BaseSalary },
    { label: "Y5S", value: contract.Y5BaseSalary },
    { label: "Yrs Left", value: contract.ContractLength },
    { label: "NTC", value: contract.NoTradeClause || "None" },
    { label: "NMC", value: contract.NoMovementClause || "None" },
  ];
};

export const getPHLTradeBlockAttributes = (
  item: TradeBlockRow,
  isPlayer: boolean,
  isMobile: boolean,
  isTablet: boolean,
  category: string
) => {
  const attributes = [
    { label: "Type", value: isPlayer ? "Player" : "Pick" },
    { label: "Name", value: item.name },
    { label: "Pos", value: item.position },
    { label: "Arch", value: item.arch },
    { label: "Yr", value: item.year },
    { label: "Ovr", value: item.overall },
    { label: "DR", value: item.draftRound },
    { label: "PN", value: item.draftPick },
    { label: "value", value: item.value },
  ];

  return attributes;
};

export const getCHLCrootAttributes = (
  player: Croot,
  isMobile: boolean,
  category: string
) => {
  const heightObj = HeightToFeetAndInches(player.Height);
  let list = [
    { label: "ID", value: player.ID },
    { label: "Name", value: `${player.FirstName} ${player.LastName}` },
    { label: "Pos", value: player.Position },
    { label: "Arch", value: player.Archetype },
    { label: "Stars", value: player.Stars },
    { label: "Ht", value: `${heightObj.feet}' ${heightObj.inches}"` },
    { label: "Wt (lbs)", value: player.Weight },
    { label: "Ct", value: annotateCountry(player.Country) },
    { label: "Re", value: annotateRegion(player.State) },
    { label: "Ovr", value: player.OverallGrade },
  ];
  if (!isMobile && category === Attributes) {
    list = list.concat(...getAdditionalHockeyCrootAttributes(player));
  } else if (!isMobile && category === Potentials) {
    list = list.concat(...getAdditionalCrootPotentialAttributes(player));
  } else if (!isMobile && category === Preferences) {
    list = list.concat(...getAdditionalCrootPreferenceAttributes(player));
  }
  return list;
};

export const getAdditionalHockeyAttributeGrades = (player: Croot) => {
  return [
    { label: "Agility", value: player.AgilityGrade },
    { label: "Faceoffs", value: player.FaceoffsGrade },
    {
      label: "LongShotAccuracy",
      value: player.LongShotAccuracyGrade,
    },
    {
      label: "LongShotPower",
      value: player.LongShotPowerGrade,
    },
    {
      label: "CloseShotAccuracy",
      value: player.CloseShotAccuracyGrade,
    },
    {
      label: "CloseShotPower",
      value: player.CloseShotPowerGrade,
    },
    { label: "Passing", value: player.PassingGrade },
    {
      label: "PuckHandling",
      value: player.PuckHandlingGrade,
    },
    { label: "Strength", value: player.StrengthGrade },
    {
      label: "BodyChecking",
      value: player.BodyCheckingGrade,
    },
    {
      label: "StickChecking",
      value: player.StickCheckingGrade,
    },
    {
      label: "ShotBlocking",
      value: player.ShotBlockingGrade,
    },
    {
      label: "Goalkeeping",
      value: player.GoalkeepingGrade,
    },
    {
      label: "GoalieVision",
      value: player.GoalieVisionGrade,
    },
  ];
};

export const getAdditionalHockeyAttributes = (
  player: CHLPlayer | PHLPlayer
) => {
  return [
    {
      label: "Agi",
      raw: player.Agility,
      value: getHockeyLetterGrade(player.Agility, player.Year),
    },
    {
      label: "FO",
      raw: player.Faceoffs,
      value: getHockeyLetterGrade(player.Faceoffs, player.Year),
    },
    {
      label: "LSA",
      raw: player.LongShotAccuracy,
      value: getHockeyLetterGrade(player.LongShotAccuracy, player.Year),
    },
    {
      label: "LSP",
      raw: player.LongShotPower,
      value: getHockeyLetterGrade(player.LongShotPower, player.Year),
    },
    {
      label: "CSA",
      raw: player.CloseShotAccuracy,
      value: getHockeyLetterGrade(player.CloseShotAccuracy, player.Year),
    },
    {
      label: "CSP",
      raw: player.CloseShotPower,
      value: getHockeyLetterGrade(player.CloseShotPower, player.Year),
    },
    {
      label: "Pass",
      raw: player.Passing,
      value: getHockeyLetterGrade(player.Passing, player.Year),
    },
    {
      label: "PH",
      raw: player.PuckHandling,
      value: getHockeyLetterGrade(player.PuckHandling, player.Year),
    },
    {
      label: "Str",
      raw: player.Strength,
      value: getHockeyLetterGrade(player.Strength, player.Year),
    },
    {
      label: "BChk",
      raw: player.BodyChecking,
      value: getHockeyLetterGrade(player.BodyChecking, player.Year),
    },
    {
      label: "SChk",
      raw: player.StickChecking,
      value: getHockeyLetterGrade(player.StickChecking, player.Year),
    },
    {
      label: "SB",
      raw: player.ShotBlocking,
      value: getHockeyLetterGrade(player.ShotBlocking, player.Year),
    },
    {
      label: "GK",
      raw: player.Goalkeeping,
      value: getHockeyLetterGrade(player.Goalkeeping, player.Year),
    },
    {
      label: "GV",
      raw: player.GoalieVision,
      value: getHockeyLetterGrade(player.GoalieVision, player.Year),
    },
    {
      label: "Sta",
      raw: player.Stamina,
      value: getGeneralLetterGrade(player.Stamina),
    },
    {
      label: "Inj",
      raw: player.InjuryRating,
      value: getGeneralLetterGrade(player.InjuryRating),
    },
  ];
};

export const getAdditionalPotentialAttributes = (
  player: CHLPlayer | PHLPlayer
) => {
  return [
    { label: "Agi", value: getGeneralLetterGrade(player.AgilityPotential) },
    { label: "FO", value: getGeneralLetterGrade(player.FaceoffsPotential) },
    {
      label: "LSA",
      value: getGeneralLetterGrade(player.LongShotAccuracyPotential),
    },
    {
      label: "LSP",
      value: getGeneralLetterGrade(player.LongShotPowerPotential),
    },
    {
      label: "CSA",
      value: getGeneralLetterGrade(player.CloseShotAccuracyPotential),
    },
    {
      label: "CSP",
      value: getGeneralLetterGrade(player.CloseShotPowerPotential),
    },
    { label: "Pass", value: getGeneralLetterGrade(player.PassingPotential) },
    {
      label: "PH",
      value: getGeneralLetterGrade(player.PuckHandlingPotential),
    },
    { label: "Str", value: getGeneralLetterGrade(player.StrengthPotential) },
    {
      label: "BChk",
      value: getGeneralLetterGrade(player.BodyCheckingPotential),
    },
    {
      label: "SChk",
      value: getGeneralLetterGrade(player.StickCheckingPotential),
    },
    {
      label: "SB",
      value: getGeneralLetterGrade(player.ShotBlockingPotential),
    },
    {
      label: "GK",
      value: getGeneralLetterGrade(player.GoalkeepingPotential),
    },
    {
      label: "GV",
      value: getGeneralLetterGrade(player.GoalieVisionPotential),
    },
    { label: "Sta", value: getGeneralLetterGrade(player.Stamina) },
    { label: "Inj", value: getGeneralLetterGrade(player.InjuryRating) },
  ];
};

export const getAdditionalHockeyCrootAttributes = (player: Croot) => {
  return [
    { label: "Agi", value: getHockeyLetterGrade(player.Agility, 1) },
    { label: "FO", value: getHockeyLetterGrade(player.Faceoffs, 1) },
    {
      label: "LSA",
      value: getHockeyLetterGrade(player.LongShotAccuracy, 1),
    },
    {
      label: "LSP",
      value: getHockeyLetterGrade(player.LongShotPower, 1),
    },
    {
      label: "CSA",
      value: getHockeyLetterGrade(player.CloseShotAccuracy, 1),
    },
    {
      label: "CSP",
      value: getHockeyLetterGrade(player.CloseShotPower, 1),
    },
    { label: "Pass", value: getHockeyLetterGrade(player.Passing, 1) },
    {
      label: "PH",
      value: getHockeyLetterGrade(player.PuckHandling, 1),
    },
    { label: "Str", value: getHockeyLetterGrade(player.Strength, 1) },
    {
      label: "BChk",
      value: getHockeyLetterGrade(player.BodyChecking, 1),
    },
    {
      label: "SChk",
      value: getHockeyLetterGrade(player.StickChecking, 1),
    },
    {
      label: "SB",
      value: getHockeyLetterGrade(player.ShotBlocking, 1),
    },
    {
      label: "GK",
      value: getHockeyLetterGrade(player.Goalkeeping, 1),
    },
    {
      label: "GV",
      value: getHockeyLetterGrade(player.GoalieVision, 1),
    },
  ];
};

export const getAdditionalCrootPotentialAttributes = (player: Croot) => {
  return [
    { label: "Agi", value: player.AgilityGrade },
    { label: "FO", value: player.FaceoffsGrade },
    {
      label: "LSA",
      value: player.LongShotAccuracyGrade,
    },
    {
      label: "LSP",
      value: player.LongShotPowerGrade,
    },
    {
      label: "CSA",
      value: player.CloseShotAccuracyGrade,
    },
    {
      label: "CSP",
      value: player.CloseShotPowerGrade,
    },
    { label: "Pass", value: player.PassingGrade },
    {
      label: "PH",
      value: player.PuckHandlingGrade,
    },
    { label: "Str", value: player.StrengthGrade },
    {
      label: "BChk",
      value: player.BodyCheckingGrade,
    },
    {
      label: "SChk",
      value: player.StickCheckingGrade,
    },
    {
      label: "SB",
      value: player.ShotBlockingGrade,
    },
    {
      label: "GK",
      value: player.GoalkeepingGrade,
    },
    {
      label: "GV",
      value: player.GoalieVisionGrade,
    },
  ];
};

export const getAdditionalCrootPreferenceAttributes = (player: Croot) => {
  return [
    { label: "ProgramPref", value: player.ProgramPref },
    { label: "ProfDevPref", value: player.ProfDevPref },
    { label: "TraditionsPref", value: player.TraditionsPref },
    { label: "FacilitiesPref", value: player.FacilitiesPref },
    { label: "AtmospherePref", value: player.AtmospherePref },
    { label: "AcademicsPref", value: player.AcademicsPref },
    { label: "ConferencePref", value: player.ConferencePref },
    { label: "CoachPref", value: player.CoachPref },
    { label: "SeasonMomentumPref", value: player.SeasonMomentumPref },
  ];
};
const archetypeAcronyms: { [key: string]: string } = {
  Pocket: "PKT",
  Scrambler: "SCR",
  Balanced: "BAL",
  "Field General": "FG",
  Power: "PWR",
  Receiving: "REC",
  Speed: "SPD",
  Blocking: "BLK",
  Rushing: "RSH",
  "Vertical Threat": "VT",
  Possession: "POS",
  "Red Zone Threat": "RZT",
  "Route Runner": "RR",
  "Pass Blocking": "PBK",
  "Run Blocking": "RBK",
  "Line Captain": "LC",
  "Nose Tackle": "NT",
  "Pass Rusher": "PRS",
  "Run Stopper": "RDS",
  "Speed Rusher": "SPR",
  Coverage: "CVG",
  "Pass Rush": "PRS",
  "Ball Hawk": "BH",
  "Man Coverage": "MCV",
  "Zone Coverage": "ZCV",
  Accuracy: "ACC",
  "Triple-Threat": "TT",
  Wingback: "WB",
  Slotback: "SB",
  Lineman: "LM",
  Strongside: "SS",
  Weakside: "WS",
  Bandit: "BND",
  "Return Specialist": "RS",
  "Soccer Player": "SP",
};

const getArchetypeValue = (archetype: string, isMobile: boolean) => {
  return isMobile && archetypeAcronyms[archetype]
    ? archetypeAcronyms[archetype]
    : archetype;
};

export const getNFLAttributes = (
  player: NFLPlayer,
  isMobile: boolean,
  category: string,
  showLetterGrade: boolean,
  contract?: any
) => {
  const nflPlayer = player as NFLPlayer;
  const nflContract = contract as NFLContract;
  const arch1 = getArchetypeValue(
    nflPlayer.Archetype,
    isMobile || player.ArchetypeTwo.length > 0
  );
  let arch2 = "";
  if (nflPlayer.ArchetypeTwo.length > 0) {
    arch2 = getArchetypeValue(
      nflPlayer.ArchetypeTwo,
      isMobile || player.ArchetypeTwo.length > 0
    );
  }
  const nflPlayerAttributes = [
    { label: "Name", value: `${nflPlayer.FirstName} ${nflPlayer.LastName}` },
    {
      label: "Pos",
      value: `${nflPlayer.Position}${
        nflPlayer.PositionTwo.length > 0 ? `/${nflPlayer.PositionTwo}` : ""
      }`,
    },
    { label: "Arch", value: `${arch1}${arch2.length > 0 ? `/${arch2}` : ""}` },
    {
      label: "Yr",
      value: `${nflPlayer.Age} / ${GetNFLYear(nflPlayer.Experience)}`,
    },
    {
      label: "Ovr",
      value: showLetterGrade
        ? GetNFLOverall(nflPlayer.Overall, true)
        : nflPlayer.Overall,
    },
  ];

  const overviewAttributes =
    !isMobile && category === Overview && nflContract
      ? [
          { label: "Pot", value: player.PotentialGrade },
          { label: "Health", value: player.IsInjured },
          {
            label: "Injury",
            value: player.InjuryType
              ? player.WeeksOfRecovery && player.WeeksOfRecovery > 0
                ? `${player.InjuryType}, ${player.WeeksOfRecovery} weeks`
                : `None`
              : "None",
          },
          {
            label: "Y1S",
            value: `${contract.Y1BaseSalary.toFixed(2)}M`,
          },
          {
            label: "Y1B",
            value: `${contract.Y1Bonus.toFixed(2)}M`,
          },
          { label: "Years Left", value: nflContract.ContractLength },
          { label: "Is Tagged", value: nflContract.IsTagged },
          { label: "IsOnTradeBlock", value: player.IsOnTradeBlock },
          { label: "PS", value: player.IsPracticeSquad },
          { label: "Personality", value: player.Personality },
          { label: "Work Ethic", value: player.WorkEthic },
        ]
      : [];

  const additionalAttributes =
    !isMobile && category === Attributes
      ? getAdditionalNFLAttributes(nflPlayer).map((attr) => ({
          ...attr,
          value: showLetterGrade
            ? GetNFLOverall(attr.value as number, true)
            : attr.value,
        }))
      : [];

  const nflContracts =
    !isMobile && category === Contracts
      ? getNFLContracts(nflContract).map((attr) => ({
          ...attr,
          value: attr.value,
        }))
      : [];

  return [
    ...nflPlayerAttributes,
    ...overviewAttributes,
    ...additionalAttributes,
    ...nflContracts,
  ];
};

export const getNFLContracts = (contract: NFLContract) => {
  return [
    { label: "Y1B", value: contract.Y1Bonus },
    { label: "Y1S", value: contract.Y1BaseSalary },
    { label: "Y2B", value: contract.Y2Bonus },
    { label: "Y2S", value: contract.Y2BaseSalary },
    { label: "Y3B", value: contract.Y3Bonus },
    { label: "Y3S", value: contract.Y3BaseSalary },
    { label: "Y4B", value: contract.Y4Bonus },
    { label: "Y4S", value: contract.Y4BaseSalary },
    { label: "Y5B", value: contract.Y5Bonus },
    { label: "Y5S", value: contract.Y5BaseSalary },
    { label: "Yrs Left", value: contract.ContractLength },
  ];
};

export const getAdditionalNFLAttributes = (player: NFLPlayer) => {
  return [
    { label: "POT", value: player.PotentialGrade },
    { label: "FIQ", value: player.FootballIQ },
    { label: "SPD", value: player.Speed },
    { label: "AGI", value: player.Agility },
    { label: "CAR", value: player.Carrying },
    { label: "CTH", value: player.Catching },
    { label: "RTE", value: player.RouteRunning },
    { label: "THP", value: player.ThrowPower },
    { label: "THA", value: player.ThrowAccuracy },
    { label: "PBK", value: player.PassBlock },
    { label: "RBK", value: player.RunBlock },
    { label: "STR", value: player.Strength },
    { label: "TKL", value: player.Tackle },
    { label: "ZCV", value: player.ZoneCoverage },
    { label: "MCV", value: player.ManCoverage },
    { label: "PRS", value: player.PassRush },
    { label: "RDF", value: player.RunDefense },
    { label: "KP", value: player.KickPower },
    { label: "KA", value: player.KickAccuracy },
    { label: "PP", value: player.PuntPower },
    { label: "PA", value: player.PuntAccuracy },
    { label: "STA", value: player.Stamina },
    { label: "INJ", value: player.Injury },
  ];
};

export const GetNFLOverall = (ovr: number, showLetterGrade: boolean) => {
  if (!showLetterGrade) return ovr;
  if (ovr > 61) return "A";
  else if (ovr > 59) return "A-";
  else if (ovr > 57) return "B+";
  else if (ovr > 55) return "B";
  else if (ovr > 53) return "B-";
  else if (ovr > 51) return "C+";
  else if (ovr > 49) return "C";
  else if (ovr > 47) return "C-";
  else if (ovr > 45) return "D+";
  else if (ovr > 43) return "D";
  else if (ovr > 41) return "D-";
  return "F";
};

export const getCFBAttributes = (
  player: CFBPlayer,
  isMobile: boolean,
  category: string
) => {
  const heightObj = HeightToFeetAndInches(player.Height);
  const arch1 = getArchetypeValue(
    player.Archetype,
    isMobile || player.ArchetypeTwo.length > 0
  );
  let arch2 = "";
  if (player.ArchetypeTwo.length > 0) {
    arch2 = getArchetypeValue(
      player.ArchetypeTwo,
      isMobile || player.ArchetypeTwo.length > 0
    );
  }
  const attributes = [
    { label: "Name", value: `${player.FirstName} ${player.LastName}` },
    {
      label: "Pos",
      value: `${player.Position}${
        player.PositionTwo.length > 0 ? `/${player.PositionTwo}` : ""
      }`,
    },
    { label: "Arch", value: `${arch1}${arch2.length > 0 ? `/${arch2}` : ""}` },
    { label: "Yr", value: getYear(player.Year, player.IsRedshirt) },
    { label: "Stars", value: player.Stars },
    { label: "Ovr", value: getCFBOverall(player.Overall, player.Year) },
  ];

  const overviewAttributes =
    !isMobile && category === Overview
      ? [
          { label: "Pot", value: player.PotentialGrade },
          { label: "Health", value: player.IsInjured },
          {
            label: "Injury",
            value: player.InjuryType
              ? player.WeeksOfRecovery && player.WeeksOfRecovery > 0
                ? `${player.InjuryType}, ${player.WeeksOfRecovery} wks`
                : `None`
              : "None",
          },
          { label: "Personality", value: player.Personality },
          { label: "WorkEthic", value: player.WorkEthic },
          { label: "AcademicBias", value: player.AcademicBias },
          { label: "Redshirt", value: player.IsRedshirting },
          { label: "TransferStatus", value: player.TransferStatus },
        ]
      : [];

  const additionalAttributes =
    !isMobile && category === Attributes
      ? getAdditionalCFBAttributes(player)
      : [];

  return [...attributes, ...overviewAttributes, ...additionalAttributes];
};

export const getAdditionalCFBAttributes = (player: CFBPlayer) => {
  return [
    { label: "POT", value: player.PotentialGrade },
    {
      label: "FIQ",
      value: getCFBLetterGrade(
        "FootballIQ",
        player.Position,
        player.FootballIQ,
        player.Year
      ),
    },
    {
      label: "SPD",
      value: getCFBLetterGrade(
        Speed,
        player.Position,
        player.Speed,
        player.Year
      ),
    },
    {
      label: "AGI",
      value: getCFBLetterGrade(
        Agility,
        player.Position,
        player.Agility,
        player.Year
      ),
    },
    {
      label: "CAR",
      value: getCFBLetterGrade(
        Carrying,
        player.Position,
        player.Carrying,
        player.Year
      ),
    },
    {
      label: "CTH",
      value: getCFBLetterGrade(
        Catching,
        player.Position,
        player.Catching,
        player.Year
      ),
    },
    {
      label: "RTE",
      value: getCFBLetterGrade(
        "RouteRunning",
        player.Position,
        player.RouteRunning,
        player.Year
      ),
    },
    {
      label: "THP",
      value: getCFBLetterGrade(
        "ThrowPower",
        player.Position,
        player.ThrowPower,
        player.Year
      ),
    },
    {
      label: "THA",
      value: getCFBLetterGrade(
        "ThrowAccuracy",
        player.Position,
        player.ThrowAccuracy,
        player.Year
      ),
    },
    {
      label: "PBK",
      value: getCFBLetterGrade(
        "PassBlock",
        player.Position,
        player.PassBlock,
        player.Year
      ),
    },
    {
      label: "RBK",
      value: getCFBLetterGrade(
        "RunBlock",
        player.Position,
        player.RunBlock,
        player.Year
      ),
    },
    {
      label: "STR",
      value: getCFBLetterGrade(
        Strength,
        player.Position,
        player.Strength,
        player.Year
      ),
    },
    {
      label: "TKL",
      value: getCFBLetterGrade(
        Tackle,
        player.Position,
        player.Tackle,
        player.Year
      ),
    },
    {
      label: "ZCV",
      value: getCFBLetterGrade(
        "ZoneCoverage",
        player.Position,
        player.ZoneCoverage,
        player.Year
      ),
    },
    {
      label: "MCV",
      value: getCFBLetterGrade(
        "ManCoverage",
        player.Position,
        player.ManCoverage,
        player.Year
      ),
    },
    {
      label: "PRS",
      value: getCFBLetterGrade(
        "PassRush",
        player.Position,
        player.PassRush,
        player.Year
      ),
    },
    {
      label: "RDF",
      value: getCFBLetterGrade(
        "RunDefense",
        player.Position,
        player.RunDefense,
        player.Year
      ),
    },
    {
      label: "KP",
      value: getCFBLetterGrade(
        "KickPower",
        player.Position,
        player.KickPower,
        player.Year
      ),
    },
    {
      label: "KA",
      value: getCFBLetterGrade(
        "KickAccuracy",
        player.Position,
        player.KickAccuracy,
        player.Year
      ),
    },
    {
      label: "PP",
      value: getCFBLetterGrade(
        "PuntPower",
        player.Position,
        player.PuntPower,
        player.Year
      ),
    },
    {
      label: "PA",
      value: getCFBLetterGrade(
        "PuntAccuracy",
        player.Position,
        player.PuntAccuracy,
        player.Year
      ),
    },
    {
      label: "STA",
      value: getCFBLetterGrade(
        "Stamina",
        player.Position,
        player.Stamina,
        player.Year
      ),
    },
    {
      label: "INJ",
      value: getCFBLetterGrade(
        "Injury",
        player.Position,
        player.Injury,
        player.Year
      ),
    },
  ];
};

export const GetNFLYear = (data: number) => {
  if (data < 2) return "R";
  return Number(data);
};

interface PriorityAttribute {
  Name: string;
  Value?: number | string;
  Letter?: string | number;
}

export const setPriorityCFBAttributes = (
  player: CFBPlayer
): PriorityAttribute[] => {
  let priorityAttributes: PriorityAttribute[] = [];

  switch (player.Position) {
    case "QB":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Carrying,
          Value: player.Carrying,
          Letter: getCFBLetterGrade(
            Carrying,
            player.Position,
            player.Carrying,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
        {
          Name: ThrowPower,
          Value: player.ThrowPower,
          Letter: getCFBLetterGrade(
            "ThrowPower",
            player.Position,
            player.ThrowPower,
            player.Year
          ),
        },
        {
          Name: ThrowAccuracy,
          Value: player.ThrowAccuracy,
          Letter: getCFBLetterGrade(
            "ThrowAccuracy",
            player.Position,
            player.ThrowAccuracy,
            player.Year
          ),
        },
        {
          Name: ShotgunRating,
          Value: getShotgunRating(player),
          Letter: getShotgunRating(player),
        },
      ];
      break;

    case "RB":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Carrying,
          Value: player.Carrying,
          Letter: getCFBLetterGrade(
            Carrying,
            player.Position,
            player.Carrying,
            player.Year
          ),
        },
        {
          Name: Catching,
          Value: player.Catching,
          Letter: getCFBLetterGrade(
            Catching,
            player.Position,
            player.Catching,
            player.Year
          ),
        },
        {
          Name: PassBlock,
          Value: player.PassBlock,
          Letter: getCFBLetterGrade(
            "PassBlock",
            player.Position,
            player.PassBlock,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
      ];
      break;

    case "FB":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Carrying,
          Value: player.Carrying,
          Letter: getCFBLetterGrade(
            Carrying,
            player.Position,
            player.Carrying,
            player.Year
          ),
        },
        {
          Name: Catching,
          Value: player.Catching,
          Letter: getCFBLetterGrade(
            Catching,
            player.Position,
            player.Catching,
            player.Year
          ),
        },
        {
          Name: PassBlock,
          Value: player.PassBlock,
          Letter: getCFBLetterGrade(
            "PassBlock",
            player.Position,
            player.PassBlock,
            player.Year
          ),
        },
        {
          Name: RunBlock,
          Value: player.RunBlock,
          Letter: getCFBLetterGrade(
            "RunBlock",
            player.Position,
            player.RunBlock,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
      ];
      break;

    case "WR":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Carrying,
          Value: player.Carrying,
          Letter: getCFBLetterGrade(
            Carrying,
            player.Position,
            player.Carrying,
            player.Year
          ),
        },
        {
          Name: Catching,
          Value: player.Catching,
          Letter: getCFBLetterGrade(
            Catching,
            player.Position,
            player.Catching,
            player.Year
          ),
        },
        {
          Name: RouteRunning,
          Value: player.RouteRunning,
          Letter: getCFBLetterGrade(
            "RouteRunning",
            player.Position,
            player.RouteRunning,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
      ];
      break;

    case "TE":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Carrying,
          Value: player.Carrying,
          Letter: getCFBLetterGrade(
            Carrying,
            player.Position,
            player.Carrying,
            player.Year
          ),
        },
        {
          Name: Catching,
          Value: player.Catching,
          Letter: getCFBLetterGrade(
            Catching,
            player.Position,
            player.Catching,
            player.Year
          ),
        },
        {
          Name: RouteRunning,
          Value: player.RouteRunning,
          Letter: getCFBLetterGrade(
            "RouteRunning",
            player.Position,
            player.RouteRunning,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
        {
          Name: PassBlock,
          Value: player.PassBlock,
          Letter: getCFBLetterGrade(
            "PassBlock",
            player.Position,
            player.PassBlock,
            player.Year
          ),
        },
        {
          Name: RunBlock,
          Value: player.RunBlock,
          Letter: getCFBLetterGrade(
            "RunBlock",
            player.Position,
            player.RunBlock,
            player.Year
          ),
        },
      ];
      break;

    case "OT":
    case "OG":
    case "C":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
        {
          Name: PassBlock,
          Value: player.PassBlock,
          Letter: getCFBLetterGrade(
            "PassBlock",
            player.Position,
            player.PassBlock,
            player.Year
          ),
        },
        {
          Name: RunBlock,
          Value: player.RunBlock,
          Letter: getCFBLetterGrade(
            "RunBlock",
            player.Position,
            player.RunBlock,
            player.Year
          ),
        },
      ];
      break;

    case "DE":
    case "DT":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Tackle,
          Value: player.Tackle,
          Letter: getCFBLetterGrade(
            Tackle,
            player.Position,
            player.Tackle,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
        {
          Name: PassRush,
          Value: player.PassRush,
          Letter: getCFBLetterGrade(
            "PassRush",
            player.Position,
            player.PassRush,
            player.Year
          ),
        },
        {
          Name: RunDefense,
          Value: player.RunDefense,
          Letter: getCFBLetterGrade(
            "RunDefense",
            player.Position,
            player.RunDefense,
            player.Year
          ),
        },
      ];
      break;

    case "ILB":
    case "OLB":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Tackle,
          Value: player.Tackle,
          Letter: getCFBLetterGrade(
            Tackle,
            player.Position,
            player.Tackle,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
        {
          Name: PassRush,
          Value: player.PassRush,
          Letter: getCFBLetterGrade(
            "PassRush",
            player.Position,
            player.PassRush,
            player.Year
          ),
        },
        {
          Name: RunDefense,
          Value: player.RunDefense,
          Letter: getCFBLetterGrade(
            "RunDefense",
            player.Position,
            player.RunDefense,
            player.Year
          ),
        },
        {
          Name: ZoneCoverage,
          Value: player.ZoneCoverage,
          Letter: getCFBLetterGrade(
            "ZoneCoverage",
            player.Position,
            player.ZoneCoverage,
            player.Year
          ),
        },
        {
          Name: ManCoverage,
          Value: player.ManCoverage,
          Letter: getCFBLetterGrade(
            "ManCoverage",
            player.Position,
            player.ManCoverage,
            player.Year
          ),
        },
      ];
      break;

    case "CB":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Tackle,
          Value: player.Tackle,
          Letter: getCFBLetterGrade(
            Tackle,
            player.Position,
            player.Tackle,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
        {
          Name: ZoneCoverage,
          Value: player.ZoneCoverage,
          Letter: getCFBLetterGrade(
            "ZoneCoverage",
            player.Position,
            player.ZoneCoverage,
            player.Year
          ),
        },
        {
          Name: ManCoverage,
          Value: player.ManCoverage,
          Letter: getCFBLetterGrade(
            "ManCoverage",
            player.Position,
            player.ManCoverage,
            player.Year
          ),
        },
        {
          Name: Catching,
          Value: player.Catching,
          Letter: getCFBLetterGrade(
            Catching,
            player.Position,
            player.Catching,
            player.Year
          ),
        },
      ];
      break;

    case "FS":
    case "SS":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Tackle,
          Value: player.Tackle,
          Letter: getCFBLetterGrade(
            Tackle,
            player.Position,
            player.Tackle,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
        {
          Name: RunDefense,
          Value: player.RunDefense,
          Letter: getCFBLetterGrade(
            "RunDefense",
            player.Position,
            player.RunDefense,
            player.Year
          ),
        },
        {
          Name: ZoneCoverage,
          Value: player.ZoneCoverage,
          Letter: getCFBLetterGrade(
            "ZoneCoverage",
            player.Position,
            player.ZoneCoverage,
            player.Year
          ),
        },
        {
          Name: ManCoverage,
          Value: player.ManCoverage,
          Letter: getCFBLetterGrade(
            "ManCoverage",
            player.Position,
            player.ManCoverage,
            player.Year
          ),
        },
        {
          Name: Catching,
          Value: player.Catching,
          Letter: getCFBLetterGrade(
            Catching,
            player.Position,
            player.Catching,
            player.Year
          ),
        },
      ];
      break;

    case "K":
      priorityAttributes = [
        {
          Name: KickAccuracy,
          Value: player.KickAccuracy,
          Letter: getCFBLetterGrade(
            "KickAccuracy",
            player.Position,
            player.KickAccuracy,
            player.Year
          ),
        },
        {
          Name: KickPower,
          Value: player.KickPower,
          Letter: getCFBLetterGrade(
            "KickPower",
            player.Position,
            player.KickPower,
            player.Year
          ),
        },
      ];
      break;

    case "P":
      priorityAttributes = [
        {
          Name: PuntAccuracy,
          Value: player.PuntAccuracy,
          Letter: getCFBLetterGrade(
            "PuntAccuracy",
            player.Position,
            player.PuntAccuracy,
            player.Year
          ),
        },
        {
          Name: PuntPower,
          Value: player.PuntPower,
          Letter: getCFBLetterGrade(
            "PuntPower",
            player.Position,
            player.PuntPower,
            player.Year
          ),
        },
      ];
      break;

    case "ATH":
      priorityAttributes = [
        {
          Name: Agility,
          Value: player.Agility,
          Letter: getCFBLetterGrade(
            Agility,
            player.Position,
            player.Agility,
            player.Year
          ),
        },
        {
          Name: Speed,
          Value: player.Speed,
          Letter: getCFBLetterGrade(
            Speed,
            player.Position,
            player.Speed,
            player.Year
          ),
        },
        {
          Name: Strength,
          Value: player.Strength,
          Letter: getCFBLetterGrade(
            Strength,
            player.Position,
            player.Strength,
            player.Year
          ),
        },
      ];
      break;

    default:
      break;
  }

  priorityAttributes.push(
    {
      Name: FootballIQ,
      Value: player.FootballIQ,
      Letter: getCFBLetterGrade(
        "FootballIQ",
        player.Position,
        player.FootballIQ,
        player.Year
      ),
    },
    {
      Name: Stamina,
      Value: player.Stamina,
      Letter: getCFBLetterGrade(
        "Stamina",
        player.Position,
        player.Stamina,
        player.Year
      ),
    },
    {
      Name: Injury,
      Value: player.Injury,
      Letter: getCFBLetterGrade(
        "Injury",
        player.Position,
        player.Injury,
        player.Year
      ),
    }
  );

  return priorityAttributes;
};

const headerMap: { [key: string]: string } = {
  Agility: Agility,
  Speed: Speed,
  Carrying: Carrying,
  ShotgunRating: "Shotgun Rating",
  ThrowPower: "Throw Power",
  ThrowAccuracy: "Throw Accuracy",
  Strength: Strength,
  Catching: Catching,
  PassBlock: "Pass Block",
  RunBlock: "Run Block",
  RouteRunning: "Route Running",
  Tackle: Tackle,
  PassRush: "Pass Rush",
  RunDefense: "Run Defense",
  ZoneCoverage: "Zone Coverage",
  ManCoverage: "Man Coverage",
  KickAccuracy: "Kick Accuracy",
  KickPower: "Kick Power",
  PuntAccuracy: "Punt Accuracy",
  PuntPower: "Punt Power",
  FootballIQ: "Football IQ",
  Stamina: "Stamina",
  Injury: "Injury",
};

const priorityAttributesMap: { [key: string]: string[] } = {
  QB: [Agility, Speed, Carrying, "ThrowPower", "ThrowAccuracy", Strength],
  RB: [Agility, Speed, Carrying, Catching, "PassBlock", Strength],
  FB: [Agility, Speed, Carrying, Catching, "PassBlock", Strength],
  WR: [Agility, Speed, Carrying, Catching, "RouteRunning", Strength],
  TE: [
    Agility,
    Speed,
    Carrying,
    Catching,
    "RouteRunning",
    Strength,
    "PassBlock",
    "RunBlock",
  ],
  OT: [Agility, Strength, "PassBlock", "RunBlock"],
  OG: [Agility, Strength, "PassBlock", "RunBlock"],
  C: [Agility, Strength, "PassBlock", "RunBlock"],
  DE: [Agility, Tackle, Strength, "PassRush", "RunDefense"],
  DT: [Agility, Tackle, Strength, "PassRush", "RunDefense"],
  ILB: [
    Agility,
    Speed,
    Tackle,
    Strength,
    "PassRush",
    "RunDefense",
    "ZoneCoverage",
    "ManCoverage",
  ],
  OLB: [
    Agility,
    Speed,
    Tackle,
    Strength,
    "PassRush",
    "RunDefense",
    "ZoneCoverage",
    "ManCoverage",
  ],
  CB: [
    Agility,
    Speed,
    Tackle,
    Strength,
    "ZoneCoverage",
    "ManCoverage",
    Catching,
  ],
  FS: [
    Agility,
    Speed,
    Tackle,
    Strength,
    "RunDefense",
    "ZoneCoverage",
    "ManCoverage",
    Catching,
  ],
  SS: [
    Agility,
    Speed,
    Tackle,
    Strength,
    "RunDefense",
    "ZoneCoverage",
    "ManCoverage",
    Catching,
  ],
  K: ["KickAccuracy", "KickPower"],
  P: ["PuntAccuracy", "PuntPower"],
  ATH: [Agility, Speed, Strength],
};

export const setPriorityNFLAttributes = (
  player: NFLPlayer,
  showLetterGrade: boolean
): PriorityAttribute[] => {
  const position = player.Position;
  const attributesForPosition = priorityAttributesMap[position] || [];
  const priorityAttributes = attributesForPosition.map((attrName) => {
    const rawValue = (player as any)[attrName];
    return {
      Name: headerMap[attrName] || attrName,
      Value: showLetterGrade ? GetNFLOverall(rawValue, true) : rawValue,
    };
  });

  if (player.Position === "QB") {
    priorityAttributes.push({
      Name: "Shotgun Rating",
      Value: getShotgunRating(player),
    });
  }

  priorityAttributes.push(
    {
      Name: "Football IQ",
      Value: showLetterGrade
        ? GetNFLOverall(player.FootballIQ, true)
        : player.FootballIQ,
    },
    {
      Name: "Stamina",
      Value: showLetterGrade
        ? GetNFLOverall(player.Stamina, true)
        : player.Stamina,
    },
    {
      Name: "Injury",
      Value: showLetterGrade
        ? GetNFLOverall(player.Injury, true)
        : player.Injury,
    }
  );

  return priorityAttributes;
};

export const getShotgunRating = (player: CFBPlayer | NFLPlayer) => {
  if (player.Shotgun === 1) {
    return "Shotgun";
  } else if (player.Shotgun === -1) {
    return "Under Center";
  }
  return "Balanced";
};

export const getCBBAttributes = (
  player: CBBPlayer,
  isMobile: boolean,
  category: string
) => {
  const attributes = [
    { label: "Name", value: `${player.FirstName} ${player.LastName}` },
    {
      label: "Pos",
      value: `${player.Position}`,
    },
    { label: "Arch", value: `${player.Archetype}` },
    { label: "Yr", value: getYear(player.Year, player.IsRedshirt) },
    { label: "Stars", value: player.Stars },
    { label: "Ovr", value: getCBBOverall(player.Overall, player.Year) },
  ];

  const overviewAttributes =
    !isMobile && category === Overview
      ? [
          { label: "Pot", value: player.PotentialGrade },
          { label: "Health", value: player.IsInjured },
          {
            label: "Injury",
            value: player.InjuryType
              ? player.WeeksOfRecovery && player.WeeksOfRecovery > 0
                ? `${player.InjuryType}, ${player.WeeksOfRecovery} wks`
                : `None`
              : "None",
          },
          { label: "Personality", value: player.Personality },
          { label: "WorkEthic", value: player.WorkEthic },
          { label: "AcademicBias", value: player.AcademicBias },
          { label: "Redshirt", value: player.IsRedshirting },
          { label: "TransferStatus", value: player.TransferStatus },
        ]
      : [];

  const additionalAttributes =
    !isMobile && category === Attributes
      ? getAdditionalCBBAttributes(player)
      : [];

  return [...attributes, ...overviewAttributes, ...additionalAttributes];
};

export const getAdditionalCBBAttributes = (player: CBBPlayer) => {
  return [
    { label: "POT", value: player.PotentialGrade },
    {
      label: "Fin",
      value: getCBBLetterGrade(player.Finishing),
    },
    {
      label: "SH2",
      value: getCBBLetterGrade(player.Shooting2),
    },
    {
      label: "SH3",
      value: getCBBLetterGrade(player.Shooting3),
    },
    {
      label: "FT",
      value: getCBBLetterGrade(player.FreeThrow),
    },
    {
      label: "BW",
      value: getCBBLetterGrade(player.Ballwork),
    },
    {
      label: "RB",
      value: getCBBLetterGrade(player.Rebounding),
    },
    {
      label: "ID",
      value: getCBBLetterGrade(player.InteriorDefense),
    },
    {
      label: "PD",
      value: getCBBLetterGrade(player.PerimeterDefense),
    },
    {
      label: "IR",
      value: getCBBLetterGrade(player.InjuryRating),
    },
    {
      label: "PTE",
      value: player.PlaytimeExpectations,
    },
    {
      label: "Min",
      value: player.Minutes,
    },
  ];
};

export const getPriorityCBBAttributes = (player: CBBPlayer) => {
  return [
    {
      label: "Finishing",
      value: getCBBLetterGrade(player.Finishing),
    },
    {
      label: "Mid Range Shooting",
      value: getCBBLetterGrade(player.Shooting2),
    },
    {
      label: "3pt Shooting",
      value: getCBBLetterGrade(player.Shooting3),
    },
    {
      label: "Free Throw",
      value: getCBBLetterGrade(player.FreeThrow),
    },
    {
      label: "Ballwork",
      value: getCBBLetterGrade(player.Ballwork),
    },
    {
      label: "Rebounding",
      value: getCBBLetterGrade(player.Rebounding),
    },
    {
      label: "Int. Defense",
      value: getCBBLetterGrade(player.InteriorDefense),
    },
    {
      label: "Per. Defense",
      value: getCBBLetterGrade(player.PerimeterDefense),
    },
    {
      label: "Injury Rating",
      value: getCBBLetterGrade(player.InjuryRating),
    },
    {
      label: "Playtime Expectations",
      value: player.PlaytimeExpectations,
    },
    {
      label: "Minutes",
      value: player.Minutes,
    },
  ];
};

export const getNBAAttributes = (
  player: NBAPlayer,
  isMobile: boolean,
  category: string
) => {
  const attributes = [
    { label: "Name", value: `${player.FirstName} ${player.LastName}` },
    {
      label: "Pos",
      value: `${player.Position}`,
    },
    { label: "Arch", value: `${player.Archetype}` },
    { label: "Age", value: player.Age },
    { label: "Yr", value: player.Year },
    { label: "Ovr", value: player.Overall },
  ];

  const overviewAttributes =
    !isMobile && category === Overview
      ? [
          { label: "Pot", value: player.PotentialGrade },
          { label: "Y1T", value: player.Contract.Year1Total },
          { label: "ContractLength", value: player.Contract.YearsRemaining },
          { label: "Health", value: player.IsInjured },
          {
            label: "Injury",
            value: player.InjuryType
              ? player.WeeksOfRecovery && player.WeeksOfRecovery > 0
                ? `${player.InjuryType}, ${player.WeeksOfRecovery} wks`
                : `None`
              : "None",
          },
          { label: "Personality", value: player.Personality },
          { label: "WorkEthic", value: player.WorkEthic },
          { label: "AcademicBias", value: player.AcademicBias },
        ]
      : [];

  const additionalAttributes =
    !isMobile && category === Attributes
      ? getAdditionalNBAAttributes(player)
      : [];

  return [...attributes, ...overviewAttributes, ...additionalAttributes];
};

export const getAdditionalNBAAttributes = (player: NBAPlayer) => {
  return [
    { label: "POT", value: player.PotentialGrade },
    {
      label: "Fin",
      value: player.Finishing,
    },
    {
      label: "SH2",
      value: player.Shooting2,
    },
    {
      label: "SH3",
      value: player.Shooting3,
    },
    {
      label: "FT",
      value: player.FreeThrow,
    },
    {
      label: "BW",
      value: player.Ballwork,
    },
    {
      label: "RB",
      value: player.Rebounding,
    },
    {
      label: "ID",
      value: player.InteriorDefense,
    },
    {
      label: "PD",
      value: player.PerimeterDefense,
    },
    {
      label: "IR",
      value: getCBBLetterGrade(player.InjuryRating),
    },
    {
      label: "PTE",
      value: player.PlaytimeExpectations,
    },
    {
      label: "Min",
      value: player.Minutes,
    },
  ];
};

export const getPriorityNBAAttributes = (player: NBAPlayer) => {
  return [
    {
      label: "Finishing",
      value: player.Finishing,
    },
    {
      label: "Mid Range Shooting",
      value: player.Shooting2,
    },
    {
      label: "3pt Shooting",
      value: player.Shooting3,
    },
    {
      label: "Free Throw",
      value: player.FreeThrow,
    },
    {
      label: "Ballwork",
      value: player.Ballwork,
    },
    {
      label: "Rebounding",
      value: player.Rebounding,
    },
    {
      label: "Int. Defense",
      value: player.InteriorDefense,
    },
    {
      label: "Per. Defense",
      value: player.PerimeterDefense,
    },
    {
      label: "Injury Rating",
      value: getCBBLetterGrade(player.InjuryRating),
    },
    {
      label: "Playtime Expectations",
      value: player.PlaytimeExpectations,
    },
    {
      label: "Minutes",
      value: player.Minutes,
    },
  ];
};
